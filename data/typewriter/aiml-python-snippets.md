# AI/ML Python Snippets

## NumPy Array Creation
- difficulty: easy

```python
import numpy as np

arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((3, 4))
ones = np.ones((2, 3))
arange = np.arange(0, 10, 2)
linspace = np.linspace(0, 1, 5)
random = np.random.randn(3, 3)

print(arr.shape, arr.dtype)
```

## NumPy Array Operations
- difficulty: easy

```python
import numpy as np

a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

print(a + b)
print(a * b)
print(a @ b)
print(np.dot(a, b))
print(a.T)
```

## NumPy Indexing and Slicing
- difficulty: easy

```python
import numpy as np

arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

print(arr[0, 1])
print(arr[:, 0])
print(arr[1:, :2])
print(arr[arr > 5])

mask = arr % 2 == 0
print(arr[mask])
```

## NumPy Broadcasting
- difficulty: medium

```python
import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
b = np.array([10, 20, 30])

result = a + b
print(result)

c = np.array([[1], [2]])
result = a * c
print(result)
```

## NumPy Statistical Operations
- difficulty: easy

```python
import numpy as np

arr = np.random.randn(100)

print(f"Mean: {np.mean(arr):.4f}")
print(f"Std: {np.std(arr):.4f}")
print(f"Min: {np.min(arr):.4f}")
print(f"Max: {np.max(arr):.4f}")
print(f"Sum: {np.sum(arr):.4f}")
print(f"Median: {np.median(arr):.4f}")
```

## NumPy Reshape and Flatten
- difficulty: easy

```python
import numpy as np

arr = np.arange(12)

reshaped = arr.reshape(3, 4)
print(reshaped)

reshaped_auto = arr.reshape(3, -1)
print(reshaped_auto)

flattened = reshaped.flatten()
raveled = reshaped.ravel()
print(flattened)
```

## Pandas DataFrame Creation
- difficulty: easy

```python
import pandas as pd

df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
})

print(df.head())
print(df.info())
print(df.describe())
```

## Pandas Read and Write CSV
- difficulty: easy

```python
import pandas as pd

df = pd.read_csv('data.csv')

df_filtered = df[df['age'] > 25]
df_filtered.to_csv('output.csv', index=False)

df_excel = pd.read_excel('data.xlsx')
df.to_excel('output.xlsx', index=False)
```

## Pandas Data Selection
- difficulty: easy

```python
import pandas as pd

df = pd.DataFrame({
    'A': [1, 2, 3],
    'B': [4, 5, 6],
    'C': [7, 8, 9]
})

print(df['A'])
print(df[['A', 'B']])
print(df.loc[0])
print(df.iloc[0:2, 0:2])
print(df[df['A'] > 1])
```

## Pandas GroupBy
- difficulty: medium

```python
import pandas as pd

df = pd.DataFrame({
    'category': ['A', 'A', 'B', 'B', 'A'],
    'value': [10, 20, 30, 40, 50]
})

grouped = df.groupby('category')
print(grouped.mean())
print(grouped.agg(['mean', 'sum', 'count']))
print(grouped['value'].transform('mean'))
```

## Pandas Merge and Join
- difficulty: medium

```python
import pandas as pd

df1 = pd.DataFrame({'key': ['A', 'B', 'C'], 'value1': [1, 2, 3]})
df2 = pd.DataFrame({'key': ['A', 'B', 'D'], 'value2': [4, 5, 6]})

merged = pd.merge(df1, df2, on='key', how='inner')
print(merged)

left_joined = pd.merge(df1, df2, on='key', how='left')
print(left_joined)
```

## Pandas Handle Missing Data
- difficulty: medium

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'A': [1, np.nan, 3],
    'B': [4, 5, np.nan]
})

print(df.isna().sum())
print(df.dropna())
print(df.fillna(0))
print(df.fillna(df.mean()))
```

## Pandas Apply and Transform
- difficulty: medium

```python
import pandas as pd

df = pd.DataFrame({
    'name': ['alice', 'bob', 'charlie'],
    'score': [85, 90, 78]
})

df['name_upper'] = df['name'].apply(str.upper)
df['grade'] = df['score'].apply(lambda x: 'A' if x >= 90 else 'B' if x >= 80 else 'C')
df['score_normalized'] = df.groupby('grade')['score'].transform(lambda x: (x - x.mean()) / x.std())

print(df)
```

## Pandas Pivot Table
- difficulty: medium

```python
import pandas as pd

df = pd.DataFrame({
    'date': ['2024-01', '2024-01', '2024-02', '2024-02'],
    'category': ['A', 'B', 'A', 'B'],
    'value': [100, 200, 150, 250]
})

pivot = pd.pivot_table(df, values='value', index='date', columns='category', aggfunc='sum')
print(pivot)
```

## Scikit-learn Train Test Split
- difficulty: easy

```python
from sklearn.model_selection import train_test_split
import numpy as np

X = np.random.randn(100, 5)
y = np.random.randint(0, 2, 100)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Train: {X_train.shape}, Test: {X_test.shape}")
```

## Scikit-learn StandardScaler
- difficulty: easy

```python
from sklearn.preprocessing import StandardScaler
import numpy as np

X = np.random.randn(100, 5) * 10 + 50

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"Before - Mean: {X.mean():.2f}, Std: {X.std():.2f}")
print(f"After - Mean: {X_scaled.mean():.2f}, Std: {X_scaled.std():.2f}")
```

## Scikit-learn Preprocessing Pipeline
- difficulty: medium

```python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, ['age', 'income']),
    ('cat', categorical_transformer, ['gender', 'city'])
])
```

## Scikit-learn Logistic Regression
- difficulty: easy

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

X = np.random.randn(1000, 10)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred))
```

## Scikit-learn Random Forest
- difficulty: medium

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import numpy as np

X = np.random.randn(1000, 10)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    random_state=42
)

scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")

model.fit(X, y)
print(f"Feature Importances: {model.feature_importances_}")
```

## Scikit-learn GridSearchCV
- difficulty: medium

```python
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
import numpy as np

X = np.random.randn(500, 10)
y = (X[:, 0] > 0).astype(int)

param_grid = {
    'C': [0.1, 1, 10],
    'kernel': ['rbf', 'linear'],
    'gamma': ['scale', 'auto']
}

grid_search = GridSearchCV(
    SVC(), param_grid, cv=5, scoring='accuracy', n_jobs=-1
)

grid_search.fit(X, y)
print(f"Best params: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")
```

## Scikit-learn KMeans Clustering
- difficulty: medium

```python
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

X = np.random.randn(300, 2)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)

print(f"Cluster centers:\n{kmeans.cluster_centers_}")
print(f"Inertia: {kmeans.inertia_:.4f}")
print(f"Silhouette Score: {silhouette_score(X, labels):.4f}")
```

## Scikit-learn PCA
- difficulty: medium

```python
from sklearn.decomposition import PCA
import numpy as np

X = np.random.randn(100, 50)

pca = PCA(n_components=10)
X_reduced = pca.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"Explained variance ratio: {pca.explained_variance_ratio_[:5]}")
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.4f}")
```

## Scikit-learn Classification Metrics
- difficulty: medium

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, roc_auc_score
)
import numpy as np

y_true = np.array([0, 0, 1, 1, 1, 0, 1, 0])
y_pred = np.array([0, 1, 1, 1, 0, 0, 1, 0])
y_prob = np.array([0.1, 0.6, 0.8, 0.9, 0.3, 0.2, 0.7, 0.1])

print(f"Accuracy: {accuracy_score(y_true, y_pred):.4f}")
print(f"Precision: {precision_score(y_true, y_pred):.4f}")
print(f"Recall: {recall_score(y_true, y_pred):.4f}")
print(f"F1: {f1_score(y_true, y_pred):.4f}")
print(f"AUC-ROC: {roc_auc_score(y_true, y_prob):.4f}")
print(f"Confusion Matrix:\n{confusion_matrix(y_true, y_pred)}")
```

## PyTorch Tensor Basics
- difficulty: easy

```python
import torch

tensor = torch.tensor([[1, 2], [3, 4]])
zeros = torch.zeros(3, 4)
ones = torch.ones(2, 3)
randn = torch.randn(3, 3)

print(tensor.shape, tensor.dtype, tensor.device)

if torch.cuda.is_available():
    tensor_gpu = tensor.to('cuda')
    print(tensor_gpu.device)
```

## PyTorch Tensor Operations
- difficulty: easy

```python
import torch

a = torch.randn(3, 4)
b = torch.randn(3, 4)

print(a + b)
print(a * b)
print(torch.matmul(a, b.T))
print(a.sum(), a.mean(), a.std())
print(a.view(4, 3))
print(a.reshape(-1))
```

## PyTorch Autograd
- difficulty: medium

```python
import torch

x = torch.tensor([2.0, 3.0], requires_grad=True)
y = x ** 2 + 2 * x + 1
z = y.sum()

z.backward()
print(f"x.grad: {x.grad}")

with torch.no_grad():
    y_no_grad = x ** 2
    print(y_no_grad)
```

## PyTorch Dataset and DataLoader
- difficulty: medium

```python
import torch
from torch.utils.data import Dataset, DataLoader

class CustomDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.FloatTensor(X)
        self.y = torch.LongTensor(y)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

dataset = CustomDataset(X_train, y_train)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

for batch_X, batch_y in dataloader:
    print(batch_X.shape, batch_y.shape)
    break
```

## PyTorch Neural Network Module
- difficulty: medium

```python
import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, x):
        return self.layers(x)

model = MLP(input_dim=10, hidden_dim=64, output_dim=2)
print(model)
```

## PyTorch Training Loop
- difficulty: medium

```python
import torch
import torch.nn as nn
import torch.optim as optim

model = nn.Linear(10, 2)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

num_epochs = 10
for epoch in range(num_epochs):
    model.train()
    total_loss = 0

    for batch_X, batch_y in train_loader:
        optimizer.zero_grad()
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1}, Loss: {total_loss/len(train_loader):.4f}")
```

## PyTorch Evaluation Loop
- difficulty: medium

```python
import torch

model.eval()
correct = 0
total = 0

with torch.no_grad():
    for batch_X, batch_y in test_loader:
        outputs = model(batch_X)
        _, predicted = torch.max(outputs, 1)
        total += batch_y.size(0)
        correct += (predicted == batch_y).sum().item()

accuracy = correct / total
print(f"Test Accuracy: {accuracy:.4f}")
```

## PyTorch Save and Load Model
- difficulty: easy

```python
import torch

torch.save(model.state_dict(), 'model.pth')

model = MLP(input_dim=10, hidden_dim=64, output_dim=2)
model.load_state_dict(torch.load('model.pth'))
model.eval()

torch.save({
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss
}, 'checkpoint.pth')
```

## PyTorch CNN
- difficulty: hard

```python
import torch
import torch.nn as nn

class CNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

model = CNN(num_classes=10)
```

## PyTorch LSTM
- difficulty: hard

```python
import torch
import torch.nn as nn

class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x):
        embedded = self.embedding(x)
        output, (hidden, cell) = self.lstm(embedded)
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        return self.fc(hidden)

model = LSTMClassifier(vocab_size=10000, embed_dim=128, hidden_dim=256, num_classes=2)
```

## PyTorch Learning Rate Scheduler
- difficulty: medium

```python
import torch.optim as optim
from torch.optim.lr_scheduler import StepLR, ReduceLROnPlateau, CosineAnnealingLR

optimizer = optim.Adam(model.parameters(), lr=0.001)

scheduler = StepLR(optimizer, step_size=10, gamma=0.1)

scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=5)

scheduler = CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(num_epochs):
    train_one_epoch()
    scheduler.step()
```

## PyTorch Transfer Learning
- difficulty: hard

```python
import torch
import torch.nn as nn
from torchvision import models

model = models.resnet18(pretrained=True)

for param in model.parameters():
    param.requires_grad = False

num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Linear(num_features, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, num_classes)
)

optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)
```

## TensorFlow Keras Sequential Model
- difficulty: easy

```python
import tensorflow as tf
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Dense(64, activation='relu', input_shape=(10,)),
    layers.Dropout(0.2),
    layers.Dense(32, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.summary()
```

## TensorFlow Keras Functional API
- difficulty: medium

```python
import tensorflow as tf
from tensorflow.keras import layers, Model

inputs = layers.Input(shape=(10,))
x = layers.Dense(64, activation='relu')(inputs)
x = layers.Dropout(0.2)(x)
x = layers.Dense(32, activation='relu')(x)
outputs = layers.Dense(1, activation='sigmoid')(x)

model = Model(inputs=inputs, outputs=outputs)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
```

## TensorFlow Keras Training
- difficulty: easy

```python
import tensorflow as tf

history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
    ]
)

loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy:.4f}")
```

## TensorFlow Keras CNN
- difficulty: medium

```python
import tensorflow as tf
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
```

## TensorFlow Keras LSTM
- difficulty: medium

```python
import tensorflow as tf
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Embedding(input_dim=10000, output_dim=128),
    layers.LSTM(64, return_sequences=True),
    layers.LSTM(32),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
```

## TensorFlow Keras Custom Layer
- difficulty: hard

```python
import tensorflow as tf

class AttentionLayer(tf.keras.layers.Layer):
    def __init__(self, units):
        super().__init__()
        self.W = tf.keras.layers.Dense(units)
        self.V = tf.keras.layers.Dense(1)

    def call(self, inputs):
        score = self.V(tf.nn.tanh(self.W(inputs)))
        attention_weights = tf.nn.softmax(score, axis=1)
        context_vector = attention_weights * inputs
        return tf.reduce_sum(context_vector, axis=1)

inputs = tf.keras.Input(shape=(100, 64))
x = AttentionLayer(32)(inputs)
outputs = tf.keras.layers.Dense(10)(x)
model = tf.keras.Model(inputs, outputs)
```

## TensorFlow Data Pipeline
- difficulty: medium

```python
import tensorflow as tf

dataset = tf.data.Dataset.from_tensor_slices((X, y))
dataset = dataset.shuffle(buffer_size=1000)
dataset = dataset.batch(32)
dataset = dataset.prefetch(tf.data.AUTOTUNE)

train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train))
train_dataset = (
    train_dataset
    .shuffle(1000)
    .batch(32)
    .map(lambda x, y: (augment(x), y))
    .prefetch(tf.data.AUTOTUNE)
)
```

## TensorFlow Transfer Learning
- difficulty: hard

```python
import tensorflow as tf

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

## TensorFlow Save and Load Model
- difficulty: easy

```python
import tensorflow as tf

model.save('my_model.keras')

model.save('my_model.h5')

loaded_model = tf.keras.models.load_model('my_model.keras')

model.save_weights('model_weights.h5')
model.load_weights('model_weights.h5')
```

## Hugging Face Transformers Text Classification
- difficulty: medium

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

text = "This movie was amazing!"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    print(predictions)
```

## Hugging Face Transformers Pipeline
- difficulty: easy

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
result = classifier("I love this product!")
print(result)

ner = pipeline("ner", aggregation_strategy="simple")
result = ner("My name is John and I live in New York.")
print(result)

generator = pipeline("text-generation", model="gpt2")
result = generator("Once upon a time", max_length=50)
print(result)
```

## Hugging Face Fine-tuning
- difficulty: hard

```python
from transformers import Trainer, TrainingArguments, AutoModelForSequenceClassification

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset
)

trainer.train()
```

## XGBoost Training
- difficulty: medium

```python
import xgboost as xgb
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
    'max_depth': 6,
    'eta': 0.1,
    'objective': 'binary:logistic',
    'eval_metric': 'auc'
}

model = xgb.train(
    params, dtrain,
    num_boost_round=100,
    evals=[(dtest, 'test')],
    early_stopping_rounds=10
)

y_pred = model.predict(dtest)
```

## LightGBM Training
- difficulty: medium

```python
import lightgbm as lgb
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

train_data = lgb.Dataset(X_train, label=y_train)
test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'learning_rate': 0.1,
    'num_leaves': 31,
    'max_depth': -1
}

model = lgb.train(
    params, train_data,
    num_boost_round=100,
    valid_sets=[test_data],
    callbacks=[lgb.early_stopping(10)]
)

y_pred = model.predict(X_test)
```

## Matplotlib Basic Plots
- difficulty: easy

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, label='sin(x)', color='blue', linewidth=2)
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.set_title('Basic Line Plot')
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('plot.png', dpi=300)
plt.show()
```

## Matplotlib Subplots
- difficulty: medium

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

axes[0, 0].plot(x, np.sin(x))
axes[0, 0].set_title('Sine')

axes[0, 1].plot(x, np.cos(x), color='orange')
axes[0, 1].set_title('Cosine')

axes[1, 0].bar(['A', 'B', 'C', 'D'], [3, 7, 2, 5])
axes[1, 0].set_title('Bar Chart')

axes[1, 1].scatter(np.random.randn(50), np.random.randn(50), alpha=0.6)
axes[1, 1].set_title('Scatter Plot')

plt.tight_layout()
plt.show()
```

## Matplotlib Histogram and Distribution
- difficulty: easy

```python
import matplotlib.pyplot as plt
import numpy as np

data = np.random.randn(1000)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].hist(data, bins=30, edgecolor='black', alpha=0.7)
axes[0].set_title('Histogram')
axes[0].set_xlabel('Value')
axes[0].set_ylabel('Frequency')

axes[1].boxplot([data, data * 2, data + 3], labels=['A', 'B', 'C'])
axes[1].set_title('Box Plot')

plt.tight_layout()
plt.show()
```

## Seaborn Distribution Plots
- difficulty: easy

```python
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

data = pd.DataFrame({
    'value': np.random.randn(500),
    'category': np.random.choice(['A', 'B', 'C'], 500)
})

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

sns.histplot(data=data, x='value', hue='category', ax=axes[0, 0])
axes[0, 0].set_title('Histogram with Hue')

sns.kdeplot(data=data, x='value', hue='category', ax=axes[0, 1])
axes[0, 1].set_title('KDE Plot')

sns.boxplot(data=data, x='category', y='value', ax=axes[1, 0])
axes[1, 0].set_title('Box Plot')

sns.violinplot(data=data, x='category', y='value', ax=axes[1, 1])
axes[1, 1].set_title('Violin Plot')

plt.tight_layout()
plt.show()
```

## Seaborn Categorical Plots
- difficulty: medium

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

tips = sns.load_dataset('tips')

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

sns.barplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[0, 0])
axes[0, 0].set_title('Bar Plot')

sns.countplot(data=tips, x='day', hue='sex', ax=axes[0, 1])
axes[0, 1].set_title('Count Plot')

sns.stripplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[1, 0], dodge=True)
axes[1, 0].set_title('Strip Plot')

sns.swarmplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[1, 1], dodge=True)
axes[1, 1].set_title('Swarm Plot')

plt.tight_layout()
plt.show()
```

## Seaborn Correlation Heatmap
- difficulty: medium

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

df = pd.DataFrame(np.random.randn(100, 5), columns=['A', 'B', 'C', 'D', 'E'])
df['B'] = df['A'] * 0.5 + np.random.randn(100) * 0.1
df['C'] = df['A'] * -0.3 + np.random.randn(100) * 0.2

correlation = df.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(
    correlation,
    annot=True,
    cmap='coolwarm',
    center=0,
    fmt='.2f',
    square=True,
    linewidths=0.5
)
plt.title('Correlation Heatmap')
plt.tight_layout()
plt.show()
```

## Seaborn Pairplot
- difficulty: easy

```python
import seaborn as sns
import matplotlib.pyplot as plt

iris = sns.load_dataset('iris')

g = sns.pairplot(
    iris,
    hue='species',
    diag_kind='kde',
    plot_kws={'alpha': 0.6},
    height=2.5
)
g.fig.suptitle('Iris Dataset Pairplot', y=1.02)
plt.show()

g = sns.pairplot(
    iris,
    hue='species',
    vars=['sepal_length', 'sepal_width', 'petal_length'],
    kind='reg',
    diag_kind='hist'
)
plt.show()
```

## Seaborn Regression Plots
- difficulty: medium

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

sns.regplot(data=tips, x='total_bill', y='tip', ax=axes[0])
axes[0].set_title('Simple Regression')

sns.lmplot(data=tips, x='total_bill', y='tip', hue='smoker', height=5)
plt.title('Regression by Group')

sns.residplot(data=tips, x='total_bill', y='tip', ax=axes[2])
axes[2].set_title('Residual Plot')

plt.tight_layout()
plt.show()
```

## Confusion Matrix Visualization
- difficulty: medium

```python
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import numpy as np

y_true = np.array([0, 0, 1, 1, 2, 2, 0, 1, 2, 0])
y_pred = np.array([0, 1, 1, 1, 2, 0, 0, 1, 2, 0])
labels = ['Class A', 'Class B', 'Class C']

cm = confusion_matrix(y_true, y_pred)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

disp = ConfusionMatrixDisplay(cm, display_labels=labels)
disp.plot(ax=axes[0], cmap='Blues')
axes[0].set_title('Confusion Matrix')

cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
sns.heatmap(cm_normalized, annot=True, fmt='.2%', cmap='Blues',
            xticklabels=labels, yticklabels=labels, ax=axes[1])
axes[1].set_title('Normalized Confusion Matrix')
axes[1].set_ylabel('True Label')
axes[1].set_xlabel('Predicted Label')

plt.tight_layout()
plt.show()
```

## ROC Curve Visualization
- difficulty: medium

```python
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc, RocCurveDisplay
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import numpy as np

X = np.random.randn(1000, 10)
y = (X[:, 0] + X[:, 1] > 0).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

model = LogisticRegression()
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]

fpr, tpr, thresholds = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC)')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.show()
```

## Learning Curve Visualization
- difficulty: medium

```python
import matplotlib.pyplot as plt
import numpy as np
from sklearn.model_selection import learning_curve
from sklearn.ensemble import RandomForestClassifier

def plot_learning_curve(estimator, X, y, cv=5):
    train_sizes, train_scores, val_scores = learning_curve(
        estimator, X, y, cv=cv,
        train_sizes=np.linspace(0.1, 1.0, 10),
        scoring='accuracy', n_jobs=-1
    )

    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    val_mean = np.mean(val_scores, axis=1)
    val_std = np.std(val_scores, axis=1)

    plt.figure(figsize=(10, 6))
    plt.plot(train_sizes, train_mean, label='Training score', color='blue')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color='blue')
    plt.plot(train_sizes, val_mean, label='Validation score', color='orange')
    plt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1, color='orange')

    plt.xlabel('Training Size')
    plt.ylabel('Score')
    plt.title('Learning Curve')
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    plt.show()

model = RandomForestClassifier(n_estimators=50, random_state=42)
plot_learning_curve(model, X, y)
```

## Feature Importance Visualization
- difficulty: medium

```python
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

feature_names = [f'Feature {i}' for i in range(X_train.shape[1])]
importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(10, 6))
plt.title('Feature Importances')
plt.bar(range(len(importances)), importances[indices], align='center')
plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45, ha='right')
plt.xlabel('Features')
plt.ylabel('Importance')
plt.tight_layout()
plt.show()

importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values('importance', ascending=False)
print(importance_df)
```

## KFold Cross-Validation
- difficulty: medium

```python
from sklearn.model_selection import KFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
import numpy as np

model = RandomForestClassifier(n_estimators=100, random_state=42)

kfold = KFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=kfold, scoring='accuracy')
print(f"Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")
print(f"Individual folds: {scores}")

for fold, (train_idx, val_idx) in enumerate(kfold.split(X)):
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]

    model.fit(X_train, y_train)
    score = model.score(X_val, y_val)
    print(f"Fold {fold + 1}: {score:.4f}")
```

## StratifiedKFold Cross-Validation
- difficulty: medium

```python
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
import numpy as np

model = LogisticRegression(max_iter=1000)

skfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=skfold, scoring='accuracy')
print(f"Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")

scoring = ['accuracy', 'precision', 'recall', 'f1']
for metric in scoring:
    scores = cross_val_score(model, X, y, cv=skfold, scoring=metric)
    print(f"{metric}: {scores.mean():.4f} (+/- {scores.std():.4f})")
```

## Cross-Validation with Multiple Metrics
- difficulty: medium

```python
from sklearn.model_selection import cross_validate, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

model = RandomForestClassifier(n_estimators=100, random_state=42)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scoring = {
    'accuracy': 'accuracy',
    'precision': 'precision_weighted',
    'recall': 'recall_weighted',
    'f1': 'f1_weighted',
    'roc_auc': 'roc_auc'
}

results = cross_validate(
    model, X, y, cv=cv,
    scoring=scoring,
    return_train_score=True,
    n_jobs=-1
)

for metric in scoring.keys():
    train_score = results[f'train_{metric}'].mean()
    test_score = results[f'test_{metric}'].mean()
    print(f"{metric}: Train={train_score:.4f}, Test={test_score:.4f}")

results_df = pd.DataFrame(results)
print(results_df.describe())
```

## Nested Cross-Validation
- difficulty: hard

```python
from sklearn.model_selection import cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
import numpy as np

outer_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
inner_cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

param_grid = {
    'n_estimators': [50, 100],
    'max_depth': [5, 10, None],
    'min_samples_split': [2, 5]
}

model = RandomForestClassifier(random_state=42)

nested_scores = []
for train_idx, test_idx in outer_cv.split(X, y):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    grid_search = GridSearchCV(model, param_grid, cv=inner_cv, scoring='accuracy', n_jobs=-1)
    grid_search.fit(X_train, y_train)

    score = grid_search.score(X_test, y_test)
    nested_scores.append(score)
    print(f"Best params: {grid_search.best_params_}, Score: {score:.4f}")

print(f"\nNested CV Accuracy: {np.mean(nested_scores):.4f} (+/- {np.std(nested_scores):.4f})")
```

## Time Series Cross-Validation
- difficulty: medium

```python
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.ensemble import GradientBoostingRegressor
import numpy as np

X = np.random.randn(1000, 5)
y = np.random.randn(1000)

tscv = TimeSeriesSplit(n_splits=5)

model = GradientBoostingRegressor(n_estimators=100, random_state=42)
scores = cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_squared_error')
rmse_scores = np.sqrt(-scores)
print(f"RMSE: {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")

for fold, (train_idx, test_idx) in enumerate(tscv.split(X)):
    print(f"Fold {fold + 1}: Train size={len(train_idx)}, Test size={len(test_idx)}")
    print(f"  Train: {train_idx[0]} to {train_idx[-1]}")
    print(f"  Test: {test_idx[0]} to {test_idx[-1]}")
```

## Scikit-learn SVM Classifier
- difficulty: medium

```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, GridSearchCV
import numpy as np

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf', probability=True))
])

param_grid = {
    'svm__C': [0.1, 1, 10, 100],
    'svm__gamma': ['scale', 'auto', 0.1, 0.01],
    'svm__kernel': ['rbf', 'linear', 'poly']
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

print(f"Best params: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")
print(f"Test score: {grid_search.score(X_test, y_test):.4f}")
```

## Scikit-learn Decision Tree
- difficulty: easy

```python
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42
)

model.fit(X_train, y_train)
print(f"Train accuracy: {model.score(X_train, y_train):.4f}")
print(f"Test accuracy: {model.score(X_test, y_test):.4f}")

plt.figure(figsize=(20, 10))
plot_tree(model, feature_names=[f'F{i}' for i in range(X.shape[1])],
          class_names=['Class 0', 'Class 1'], filled=True, rounded=True)
plt.tight_layout()
plt.show()
```

## Scikit-learn Gradient Boosting
- difficulty: medium

```python
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import numpy as np

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    min_samples_split=5,
    min_samples_leaf=2,
    subsample=0.8,
    random_state=42
)

model.fit(X_train, y_train)

print(f"Train accuracy: {model.score(X_train, y_train):.4f}")
print(f"Test accuracy: {model.score(X_test, y_test):.4f}")

train_scores = []
for i, y_pred in enumerate(model.staged_predict(X_train)):
    train_scores.append((y_pred == y_train).mean())

print(f"Best iteration: {np.argmax(train_scores) + 1}")
```

## Scikit-learn Voting Classifier
- difficulty: medium

```python
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

clf1 = LogisticRegression(max_iter=1000)
clf2 = RandomForestClassifier(n_estimators=100, random_state=42)
clf3 = GradientBoostingClassifier(n_estimators=100, random_state=42)
clf4 = SVC(probability=True, random_state=42)

voting_hard = VotingClassifier(
    estimators=[('lr', clf1), ('rf', clf2), ('gb', clf3), ('svc', clf4)],
    voting='hard'
)

voting_soft = VotingClassifier(
    estimators=[('lr', clf1), ('rf', clf2), ('gb', clf3), ('svc', clf4)],
    voting='soft'
)

for clf, name in [(clf1, 'LR'), (clf2, 'RF'), (clf3, 'GB'), (clf4, 'SVC'),
                   (voting_hard, 'Hard Voting'), (voting_soft, 'Soft Voting')]:
    scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
    print(f"{name}: {scores.mean():.4f} (+/- {scores.std():.4f})")
```

## Scikit-learn Stacking Classifier
- difficulty: hard

```python
from sklearn.ensemble import StackingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

base_learners = [
    ('rf', RandomForestClassifier(n_estimators=100, random_state=42)),
    ('gb', GradientBoostingClassifier(n_estimators=100, random_state=42)),
    ('svc', SVC(probability=True, random_state=42))
]

stacking_clf = StackingClassifier(
    estimators=base_learners,
    final_estimator=LogisticRegression(max_iter=1000),
    cv=5,
    stack_method='predict_proba',
    n_jobs=-1
)

scores = cross_val_score(stacking_clf, X, y, cv=5, scoring='accuracy')
print(f"Stacking Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")

stacking_clf.fit(X_train, y_train)
print(f"Test Accuracy: {stacking_clf.score(X_test, y_test):.4f}")
```

## Text Preprocessing Basic
- difficulty: easy

```python
import re
import string

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def remove_stopwords(text, stopwords):
    words = text.split()
    return ' '.join([w for w in words if w not in stopwords])

text = "Check out this AMAZING product at https://example.com! Email: test@email.com #sale"
cleaned = clean_text(text)
print(cleaned)
```

## NLTK Text Processing
- difficulty: medium

```python
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

text = "The cats are running quickly through the forests. They were chasing mice."

sentences = sent_tokenize(text)
tokens = word_tokenize(text.lower())
print(f"Tokens: {tokens}")

stop_words = set(stopwords.words('english'))
filtered = [w for w in tokens if w not in stop_words and w.isalpha()]
print(f"Filtered: {filtered}")

stemmer = PorterStemmer()
stemmed = [stemmer.stem(w) for w in filtered]
print(f"Stemmed: {stemmed}")

lemmatizer = WordNetLemmatizer()
lemmatized = [lemmatizer.lemmatize(w) for w in filtered]
print(f"Lemmatized: {lemmatized}")
```

## SpaCy Text Processing
- difficulty: medium

```python
import spacy

nlp = spacy.load('en_core_web_sm')

text = "Apple is looking at buying U.K. startup for $1 billion"
doc = nlp(text)

print("Tokens:")
for token in doc:
    print(f"  {token.text}: {token.pos_}, {token.dep_}, {token.lemma_}")

print("\nNamed Entities:")
for ent in doc.ents:
    print(f"  {ent.text}: {ent.label_}")

print("\nNoun Chunks:")
for chunk in doc.noun_chunks:
    print(f"  {chunk.text}")

tokens = [token.lemma_.lower() for token in doc
          if not token.is_stop and not token.is_punct and token.is_alpha]
print(f"\nProcessed tokens: {tokens}")
```

## TF-IDF Vectorization
- difficulty: medium

```python
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import pandas as pd

documents = [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks with many layers",
    "Natural language processing deals with text data",
    "Computer vision processes image and video data"
]

tfidf = TfidfVectorizer(
    max_features=100,
    stop_words='english',
    ngram_range=(1, 2),
    min_df=1,
    max_df=0.9
)

tfidf_matrix = tfidf.fit_transform(documents)

feature_names = tfidf.get_feature_names_out()
df = pd.DataFrame(tfidf_matrix.toarray(), columns=feature_names)
print(df)

count_vec = CountVectorizer(stop_words='english')
count_matrix = count_vec.fit_transform(documents)
print(f"Vocabulary size: {len(count_vec.vocabulary_)}")
```

## Word Embeddings with Gensim
- difficulty: medium

```python
from gensim.models import Word2Vec, KeyedVectors
import numpy as np

sentences = [
    ['machine', 'learning', 'is', 'great'],
    ['deep', 'learning', 'uses', 'neural', 'networks'],
    ['natural', 'language', 'processing', 'is', 'nlp'],
    ['computer', 'vision', 'processes', 'images']
]

model = Word2Vec(
    sentences,
    vector_size=100,
    window=5,
    min_count=1,
    workers=4,
    epochs=100
)

vector = model.wv['machine']
print(f"Vector shape: {vector.shape}")

similar = model.wv.most_similar('learning', topn=3)
print(f"Similar to 'learning': {similar}")

model.save('word2vec.model')
loaded_model = Word2Vec.load('word2vec.model')

def get_document_vector(doc, model):
    vectors = [model.wv[word] for word in doc if word in model.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(model.vector_size)
```

## Text Classification Pipeline
- difficulty: hard

```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report

texts = ["I love this product", "Great quality", "Terrible experience", "Waste of money", "Highly recommended"]
labels = [1, 1, 0, 0, 1]

X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english'
    )),
    ('clf', LogisticRegression(max_iter=1000))
])

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

print(classification_report(y_test, y_pred))

for clf_name, clf in [('NB', MultinomialNB()), ('LR', LogisticRegression(max_iter=1000)), ('SVM', LinearSVC())]:
    pipe = Pipeline([('tfidf', TfidfVectorizer()), ('clf', clf)])
    scores = cross_val_score(pipe, texts, labels, cv=3, scoring='accuracy')
    print(f"{clf_name}: {scores.mean():.4f}")
```

## Regex Text Extraction
- difficulty: medium

```python
import re
from typing import List, Dict

def extract_emails(text: str) -> List[str]:
    pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    return re.findall(pattern, text)

def extract_urls(text: str) -> List[str]:
    pattern = r'https?://(?:www\.)?[\w\.-]+(?:/[\w\.-]*)*'
    return re.findall(pattern, text)

def extract_phones(text: str) -> List[str]:
    pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    return re.findall(pattern, text)

def extract_dates(text: str) -> List[str]:
    patterns = [
        r'\d{4}-\d{2}-\d{2}',
        r'\d{2}/\d{2}/\d{4}',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b'
    ]
    dates = []
    for pattern in patterns:
        dates.extend(re.findall(pattern, text))
    return dates

def extract_numbers(text: str) -> List[float]:
    pattern = r'-?\d+\.?\d*'
    return [float(n) for n in re.findall(pattern, text)]

text = "Contact us at info@example.com or call 555-123-4567. Visit https://example.com"
print(f"Emails: {extract_emails(text)}")
print(f"Phones: {extract_phones(text)}")
print(f"URLs: {extract_urls(text)}")
```

## Sentiment Analysis with TextBlob
- difficulty: easy

```python
from textblob import TextBlob
import pandas as pd

texts = [
    "I absolutely love this product! It's amazing!",
    "This is the worst purchase I've ever made.",
    "The quality is okay, nothing special.",
    "Fantastic service and great value for money!"
]

results = []
for text in texts:
    blob = TextBlob(text)
    results.append({
        'text': text,
        'polarity': blob.sentiment.polarity,
        'subjectivity': blob.sentiment.subjectivity,
        'sentiment': 'positive' if blob.sentiment.polarity > 0 else 'negative' if blob.sentiment.polarity < 0 else 'neutral'
    })

df = pd.DataFrame(results)
print(df)

text = "I recieved teh prodcut yesturday"
blob = TextBlob(text)
print(f"Corrected: {blob.correct()}")
```
