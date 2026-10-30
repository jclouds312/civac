"""
Modelos Machine Learning para CIVAC PRO
Predicciones de salud, producción y reproducción bovina
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
from typing import Dict, List, Tuple
import json
from datetime import datetime, timedelta


class CivacMLModels:
    """Contenedor de modelos ML para CIVAC"""

    def __init__(self):
        self.health_model = None
        self.production_model = None
        self.reproduction_model = None
        self.nutrition_model = None
        self.scaler = StandardScaler()
        self.model_metadata = {}

    def train_health_model(
        self,
        training_data: List[Dict],
        labels: List[float]
    ) -> Dict:
        """
        Entrenar modelo de predicción de salud
        Features: temperatura, frecuencia cardíaca, tasa respiratoria, comportamiento, apetito
        """
        X = np.array([
            [
                d.get('temperature', 38.5),
                d.get('heart_rate', 60),
                d.get('respiratory_rate', 30),
                d.get('behavior', 5),
                d.get('appetite', 5),
                d.get('milk_quality', 5),
            ]
            for d in training_data
        ])

        X_scaled = self.scaler.fit_transform(X)
        y = np.array(labels)

        # Modelo de Random Forest
        self.health_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        self.health_model.fit(X_scaled, y)

        # Calcular métricas
        train_score = self.health_model.score(X_scaled, y)
        
        self.model_metadata['health'] = {
            'version': '1.0',
            'trained_at': datetime.now().isoformat(),
            'accuracy': float(train_score),
            'n_samples': len(training_data),
            'features': ['temperature', 'heart_rate', 'respiratory_rate', 'behavior', 'appetite', 'milk_quality']
        }

        return {
            'status': 'success',
            'accuracy': float(train_score),
            'n_samples': len(training_data)
        }

    def train_production_model(
        self,
        training_data: List[Dict],
        labels: List[float]
    ) -> Dict:
        """
        Entrenar modelo de predicción de producción lechera
        Features: edad, ciclo de lactancia, peso, BCS, calidad de alimento
        """
        X = np.array([
            [
                d.get('age', 3),
                d.get('lactation_cycle', 150),
                d.get('weight', 500),
                d.get('bcs', 3),  # Body Condition Score
                d.get('feed_quality', 7),
                d.get('days_in_lactation', 100),
            ]
            for d in training_data
        ])

        X_scaled = self.scaler.fit_transform(X)
        y = np.array(labels)

        # Modelo de Gradient Boosting para regresión
        self.production_model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.production_model.fit(X_scaled, y)

        train_score = self.production_model.score(X_scaled, y)

        self.model_metadata['production'] = {
            'version': '1.0',
            'trained_at': datetime.now().isoformat(),
            'accuracy': float(train_score),
            'n_samples': len(training_data),
            'features': ['age', 'lactation_cycle', 'weight', 'bcs', 'feed_quality', 'days_in_lactation']
        }

        return {
            'status': 'success',
            'accuracy': float(train_score),
            'n_samples': len(training_data)
        }

    def train_reproduction_model(
        self,
        training_data: List[Dict],
        labels: List[int]
    ) -> Dict:
        """
        Entrenar modelo de predicción de estado reproductivo
        Features: edad, ciclo reproductor, intentos previos, patrón de temperatura
        """
        X = np.array([
            [
                d.get('age', 3),
                d.get('days_since_birth', 1095),
                d.get('days_since_last_cycle', 10),
                d.get('cycle_duration', 21),
                d.get('previous_conceptions', 1),
                d.get('temp_pattern_value', 0.5),  # 0=stable, 1=rising, 0.5=fluctuating
            ]
            for d in training_data
        ])

        X_scaled = self.scaler.fit_transform(X)
        y = np.array(labels)

        self.reproduction_model = GradientBoostingClassifier(
            n_estimators=50,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        self.reproduction_model.fit(X_scaled, y)

        train_score = self.reproduction_model.score(X_scaled, y)

        self.model_metadata['reproduction'] = {
            'version': '1.0',
            'trained_at': datetime.now().isoformat(),
            'accuracy': float(train_score),
            'n_samples': len(training_data),
            'features': ['age', 'days_since_birth', 'days_since_last_cycle', 'cycle_duration', 'previous_conceptions', 'temp_pattern']
        }

        return {
            'status': 'success',
            'accuracy': float(train_score),
            'n_samples': len(training_data)
        }

    def predict_health(self, features: Dict) -> Dict:
        """Predecir estado de salud"""
        if not self.health_model:
            return {'error': 'Health model not trained'}

        X = np.array([[
            features.get('temperature', 38.5),
            features.get('heart_rate', 60),
            features.get('respiratory_rate', 30),
            features.get('behavior', 5),
            features.get('appetite', 5),
            features.get('milk_quality', 5),
        ]])

        X_scaled = self.scaler.transform(X)
        prediction = self.health_model.predict(X_scaled)[0]
        importance = self.health_model.feature_importances_

        return {
            'prediction': float(prediction),
            'confidence': float(np.max(self.health_model.predict_proba(X_scaled)) if hasattr(self.health_model, 'predict_proba') else 0.8),
            'feature_importance': {
                'temperature': float(importance[0]),
                'heart_rate': float(importance[1]),
                'respiratory_rate': float(importance[2]),
                'behavior': float(importance[3]),
                'appetite': float(importance[4]),
                'milk_quality': float(importance[5]),
            }
        }

    def predict_production(self, features: Dict) -> Dict:
        """Predecir producción lechera esperada"""
        if not self.production_model:
            return {'error': 'Production model not trained'}

        X = np.array([[
            features.get('age', 3),
            features.get('lactation_cycle', 150),
            features.get('weight', 500),
            features.get('bcs', 3),
            features.get('feed_quality', 7),
            features.get('days_in_lactation', 100),
        ]])

        X_scaled = self.scaler.transform(X)
        prediction = self.production_model.predict(X_scaled)[0]

        return {
            'expected_production_liters': float(prediction * 40),  # Escalar a 0-40 L/día
            'confidence': float(self.production_model.score(X_scaled, [prediction])),
            'recommendation': self._get_production_recommendation(prediction)
        }

    def predict_reproduction(self, features: Dict) -> Dict:
        """Predecir disponibilidad reproductiva"""
        if not self.reproduction_model:
            return {'error': 'Reproduction model not trained'}

        X = np.array([[
            features.get('age', 3),
            features.get('days_since_birth', 1095),
            features.get('days_since_last_cycle', 10),
            features.get('cycle_duration', 21),
            features.get('previous_conceptions', 1),
            features.get('temp_pattern_value', 0.5),
        ]])

        X_scaled = self.scaler.transform(X)
        prediction = self.reproduction_model.predict(X_scaled)[0]
        probability = self.reproduction_model.predict_proba(X_scaled)[0]

        return {
            'in_estrus': bool(prediction),
            'probability': float(max(probability)),
            'recommendation': 'Ready for breeding' if prediction else 'Not ready for breeding'
        }

    def batch_predict(self, animals: List[Dict], model_type: str) -> List[Dict]:
        """Predicción batch para múltiples animales"""
        results = []
        
        for animal in animals:
            if model_type == 'health':
                result = self.predict_health(animal.get('features', {}))
            elif model_type == 'production':
                result = self.predict_production(animal.get('features', {}))
            elif model_type == 'reproduction':
                result = self.predict_reproduction(animal.get('features', {}))
            else:
                result = {'error': f'Unknown model type: {model_type}'}
            
            results.append({
                'animal_id': animal.get('id'),
                'prediction': result
            })
        
        return results

    def save_models(self, path: str = './models'):
        """Guardar modelos entrenados"""
        import os
        os.makedirs(path, exist_ok=True)

        if self.health_model:
            joblib.dump(self.health_model, f'{path}/health_model.pkl')
        if self.production_model:
            joblib.dump(self.production_model, f'{path}/production_model.pkl')
        if self.reproduction_model:
            joblib.dump(self.reproduction_model, f'{path}/reproduction_model.pkl')

        with open(f'{path}/metadata.json', 'w') as f:
            json.dump(self.model_metadata, f, indent=2)

    def load_models(self, path: str = './models'):
        """Cargar modelos pre-entrenados"""
        try:
            self.health_model = joblib.load(f'{path}/health_model.pkl')
            self.production_model = joblib.load(f'{path}/production_model.pkl')
            self.reproduction_model = joblib.load(f'{path}/reproduction_model.pkl')

            with open(f'{path}/metadata.json', 'r') as f:
                self.model_metadata = json.load(f)

            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False

    def _get_production_recommendation(self, prediction: float) -> str:
        """Generar recomendación basada en predicción"""
        if prediction < 0.3:
            return 'Low production - check nutrition and health'
        elif prediction < 0.6:
            return 'Below average - optimize feed quality'
        elif prediction < 0.8:
            return 'Good production - maintain current management'
        else:
            return 'Excellent production - monitor to maintain levels'


# Instancia global
ml_models = CivacMLModels()
