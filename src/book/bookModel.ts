import mongoos from "mongoose";
const bookSchema = new mongoos.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    category: {
      type: String,
      require: true,
    },
    trending: {
      type: Boolean,
      require: true,
    },
    coverImage: {
      type: String,
      require: true,
    },
    oldPrice: {
      type: Number,
    },
    newPrice: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

const Book = mongoos.model("book", bookSchema);

module.exports = Book;
