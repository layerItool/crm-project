import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Подключено к MongoDB"))
  .catch((err) => console.error("❌ Ошибка подключения:", err));

// Схема заявки
const ItemSchema = new mongoose.Schema(
  {
    lastId: Number,
    items: [
      {
        id: Number,
        nam: String,
        tel: String,
        mail: String,
        prodact: String,
        status: String,
        dateDate: String,
        dateTime: String,
      },
    ],
  },
  { collection: "items", versionKey: false },
);

const Item = mongoose.model("Item", ItemSchema);

// Счётчик
const counterSchema = new mongoose.Schema(
  {
    _id: String,
    lastId: Number,
  },
  { collection: "counters" },
);

const Counter = mongoose.model("Counter", counterSchema);

// Функция получения нового ID
async function getNextId() {
  const counter = await Counter.findByIdAndUpdate(
    "items",
    { $inc: { lastId: 1 } },
    { new: true, upsert: true },
  );
  return counter.lastId;
}

// 📄 Получить все заявки
app.get("/items", async (req, res) => {
  const doc = await Item.findOne();
  res.json(doc.items);
});

// 📄 Получить заявку по id
app.get("/items/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const doc = await Item.findOne(); // 👈 просто берём документ

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const item = doc.items.find((i) => i.id === id); // 👈 достаём нужный элемент

    res.json(item); // 👈 возвращаем ТОЛЬКО элемент
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➕ Добавить заявку
app.post("/items", async (req, res) => {
  const doc = await Item.findOne();

  const newId = doc.lastId + 1;

  const newItem = {
    id: newId,
    ...req.body,
  };

  doc.items.push(newItem);
  doc.lastId = newId;

  await doc.save();

  res.json(newItem);
});

// ✏️ Обновить заявку
app.put("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updated = await Item.findOneAndUpdate({ id }, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: "Не найдено" });
  res.json(updated);
});

// 🗑️ Удалить заявку
app.delete("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await Item.findOneAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "Не найдено" });
  res.json({ success: true });
});

app.listen(4000, () =>
  console.log("🚀 Сервер запущен на http://localhost:4000"),
);
