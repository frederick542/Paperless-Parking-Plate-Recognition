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
        self.reader = easyocr.Reader(['en'])  # Initialize once

    def predict(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes))
        results = self.model(image)
        detections = sv.Detections.from_ultralytics(results[0])

        license_plates = self.extract_license_plates(image, detections)
        if not license_plates:
            return {"error": "No license plates detected"}

        nearest_license_plate = max(license_plates, key=lambda x: x[1])
        processed_text = self.process_license_plate(nearest_license_plate[0])
        return {"license_plate": processed_text}

    def extract_license_plates(self, image, detections):
        license_plates = []
        original_image = np.array(image)

        for i, class_id in enumerate(detections.class_id):
            if detections.data['class_name'][i] == 'License_Plate':
                box_coordinates = np.float32(detections[i].data['xyxyxyxy'][0])
                min_y_idx = np.argmin(box_coordinates[:, 1])
                x_current = box_coordinates[min_y_idx][0]
                x_forward = box_coordinates[(min_y_idx + 1) % 4][0]
                x_backward = box_coordinates[(min_y_idx - 1) % 4][0]

                if abs(x_forward - x_current) <= abs(x_current - x_backward):
                    idxs = [min_y_idx, np.argmax(box_coordinates[:, 0]), np.argmin(box_coordinates[:, 0]), np.argmax(box_coordinates[:, 1])]
                else:
                    idxs = [np.argmin(box_coordinates[:, 0]), min_y_idx, np.argmax(box_coordinates[:, 1]), np.argmax(box_coordinates[:, 0])]

                points = box_coordinates[idxs].astype("float32")
                width = int(max(np.linalg.norm(points[1] - points[0]), np.linalg.norm(points[3] - points[2])))
                height = int(max(np.linalg.norm(points[2] - points[0]), np.linalg.norm(points[3] - points[1])))
                dst = np.array([[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]], dtype="float32")

                M = cv.getPerspectiveTransform(points, dst)
                image_cropped = cv.warpPerspective(original_image, M, (width, height))
                area = width * height
                license_plates.append([image_cropped, area, i])

        return license_plates

    def process_license_plate(self, nearest_license_plate):
        denoise_image = cv.fastNlMeansDenoising(nearest_license_plate, None, 7, 15, 13)
        gray_image = cv.cvtColor(denoise_image, cv.COLOR_BGR2GRAY)
        _, threshold_image = cv.threshold(gray_image, 0, 255, cv.THRESH_OTSU + cv.THRESH_BINARY)
        text = self.read_from_image(threshold_image).upper()
        clean_text = self.clean_text(text)
        return clean_text

    def read_from_image(self, image):
        results = self.reader.readtext(image)
        text = " ".join([result[1] for result in results])
        return text

    def clean_text(self, text: str):
        text = text.replace(' ', '')
        text = list(text)
        word_section = 1
        word_count = 0

        for i, char in enumerate(text[:-1]):
            if word_section == 3:
                word_count += 1
            if word_section % 2 == 1:
                if text[i] in self.missread_possibility:
                    text[i] = self.missread_possibility[text[i]]
            else:
                if text[i] in self.missread_possibility_num:
                    text[i] = self.missread_possibility_num[text[i]]
            if (char.isalpha() and text[i + 1].isdigit()) or (char.isdigit() and text[i + 1].isalpha()):
                word_section += 1
            if word_section >= 4 or word_count >= 3:
                return ''.join(text[:i + 1]).translate(self.translation_table)
        return ''.join(text).translate(self.translation_table)
