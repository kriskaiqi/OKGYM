import cv2
import mediapipe as mp
import numpy as np

class PoseDetector:
    def __init__(self, static_image_mode=False, model_complexity=1, min_detection_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils
        
    def detect_pose(self, image):
        """
        Detect pose landmarks in an image
        Args:
            image: BGR image
        Returns:
            landmarks: Normalized pose landmarks
            image: Image with landmarks drawn
        """
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        
        if results.pose_landmarks:
            self.mp_draw.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )
            landmarks = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in results.pose_landmarks.landmark])
            return landmarks, image
        return None, image

    def get_angle(self, landmarks, p1, p2, p3):
        """
        Calculate angle between three points
        Args:
            landmarks: Pose landmarks
            p1, p2, p3: Indices of three points to calculate angle
        Returns:
            angle: Angle in degrees
        """
        if landmarks is None:
            return None
            
        # Get coordinates
        p1_coords = landmarks[p1][:2]
        p2_coords = landmarks[p2][:2]
        p3_coords = landmarks[p3][:2]
        
        # Calculate angle
        radians = np.arctan2(p3_coords[1] - p2_coords[1], p3_coords[0] - p2_coords[0]) - \
                 np.arctan2(p1_coords[1] - p2_coords[1], p1_coords[0] - p2_coords[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle 