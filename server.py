import os
from flask import Flask, request, jsonify
import numpy as np
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)

# Определите путь к директории данных
data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

# Загрузите токенизатор и модель
with open(os.path.join(data_dir, 'tokenizer.pkl'), 'rb') as f:
    tokenizer = pickle.load(f)

model = load_model(os.path.join(data_dir, 'chatbot_model.keras'))

# Параметры
MAX_LENGTH = 20

@app.route('/message', methods=['POST'])
def handle_message():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400

    # Преобразование текста в последовательность
    sequences = tokenizer.texts_to_sequences([user_input])
    padded_sequences = pad_sequences(sequences, maxlen=MAX_LENGTH, padding='post')

    # Получение ответа от модели
    prediction = model.predict(padded_sequences)
    predicted_sequence = np.argmax(prediction, axis=-1)

    # Декодирование ответа
    reverse_word_map = {v: k for k, v in tokenizer.word_index.items()}
    response = ' '.join([reverse_word_map.get(word_id, 'Unknown') for word_id in predicted_sequence[0]])

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
