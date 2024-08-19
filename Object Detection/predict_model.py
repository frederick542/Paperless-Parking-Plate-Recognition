from ultralytics import YOLO
from PIL import Image
import io
import supervision as sv
import numpy as np
import easyocr
import cv2 as cv


class YOLOModel:
    def __init__(self, model_path: str):
        self.model = YOLO(model_path)
        self.remove_chars = '.,@#!$%^&*()[]{}|\\:;\'"<>?/`~_'
        self.translation_table = str.maketrans('', '', self.remove_chars)
        self.missread_possibility = {"8": "B", "1": "I", "0": "O", "4": "H", "2": "Z"}
        self.missread_possibility_num = {"B": "8", "I": "1", "O": "0", "H": "4", "Z": "2"}
        self.reader = easyocr.Reader(['en']) 

    def predict(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes))
        results = self.model(image)
        detections = sv.Detections.from_ultralytics(results[0])

        license_plates = self.extract_license_plates(np.array(image)[..., ::-1], detections)
        if not license_plates:
            return "No license plates detected"

        nearest_license_plate = max(license_plates, key=lambda x: x[1])
        processed_text = self.process_license_plate(nearest_license_plate[0])
        return  processed_text


    def extract_license_plates(self, image, detections):
        license_plates = []
        for i,class_id in enumerate(detections.class_id):
            if detections.data['class_name'][i] == 'License_Plate':
                BoxCoordinate= np.float32(detections[i].data['xyxyxyxy'][0])
                idxPoint1 = np.argmin(BoxCoordinate[:, 1])
                xCurrent = BoxCoordinate[idxPoint1][0]
                xFoward = BoxCoordinate[(idxPoint1 + 1) % 4][0]
                xBackward = BoxCoordinate[(idxPoint1 - 1) % 4][0]
                if(xFoward <= xCurrent):
                    xBackward, xFoward = xFoward, xBackward
                    
                if((xFoward - xCurrent == 0) | (xBackward - xCurrent == 0) ):
                    x1,y1,x2,y2 = class_id.xyxy
                    x1,y1,x2,y2 = int(x1), int(y1), int(x2), int(y2)
                    imageCropped = image[y1:y2,x1:x2]
                    area = (x2 - x1) * (y2 -y1)
                    license_plates.append([imageCropped,area,i])
                    continue
                elif((xFoward - xCurrent) > (xCurrent - xBackward)):
                    idxPoint2 = np.argmax(BoxCoordinate[:, 0])
                    idxPoint3 = np.argmin(BoxCoordinate[:, 0])
                    idxPoint4 = np.argmax(BoxCoordinate[:, 1])
                else:
                    idxPoint2 = idxPoint1
                    idxPoint3 = np.argmax(BoxCoordinate[:, 1])
                    idxPoint1 = np.argmin(BoxCoordinate[:, 0])
                    idxPoint4 = np.argmax(BoxCoordinate[:, 0])
                
                # top left corner, top right corner, bottom left corner, bottom right corner
                val = 3
                point1 = np.array([BoxCoordinate[idxPoint1][0] + val, BoxCoordinate[idxPoint1][1] + val], dtype="float32")
                point2 = np.array([BoxCoordinate[idxPoint2][0] - val, BoxCoordinate[idxPoint2][1] + val], dtype="float32")
                point3 = np.array([BoxCoordinate[idxPoint3][0] + val, BoxCoordinate[idxPoint3][1] - val], dtype="float32")
                point4 = np.array([BoxCoordinate[idxPoint4][0] - val, BoxCoordinate[idxPoint4][1] - val], dtype="float32")
                points = [point1, point2, point3, point4]
                width = int(max(np.linalg.norm(point2 - point1), np.linalg.norm(point4 - point2)))
                height = int(max(np.linalg.norm(point3 - point1), np.linalg.norm(point4 - point2)))
                dst = np.array([
                    [0, 0],
                    [width - 1, 0],
                    [0, height - 1],
                    [width - 1, height - 1],
                ], dtype="float32")

                M = cv.getPerspectiveTransform(np.float32(points), dst)
                imageCropped = cv.warpPerspective(image, M, (width, height))
                print()
                area = width * height
                license_plates.append([imageCropped,area,i])
        return license_plates


    def process_license_plate(self, image):
        DenoiseImage = cv.fastNlMeansDenoising(image, None, 7, 5, 3)
        GrayImage = cv.cvtColor(DenoiseImage, cv.COLOR_BGR2GRAY)
        _, image = cv.threshold(GrayImage, 0, 255, cv.THRESH_OTSU + cv.THRESH_BINARY )
        results = self.reader.readtext(image)
        text = ""
        for result in results:
            text += result[1] + " "
        clean_text = self.clean_text(text.upper())
        return clean_text


    def clean_text(self, text: str):
        text = text.replace(' ', '')
        text = list(text)
        word_section = 1
        word_count = 0
        length = len(text[:-1])
        for i in range(length):
            if word_section == 3:
                word_count += 1
            if word_section % 2 == 1:
                if text[i] in self.missread_possibility:
                    text[i] = self.missread_possibility[text[i]]
            else:
                if text[i] in self.missread_possibility_num:
                    text[i] = self.missread_possibility_num[text[i]]
            if (text[i].isalpha() and text[i + 1].isdigit()) or (text[i].isdigit() and text[i + 1].isalpha()):
                word_section += 1
            if word_section >= 4 or word_count >= 3:
                return ''.join(text[:i + 1]).translate(self.translation_table)
        return ''.join(text).translate(self.translation_table)
