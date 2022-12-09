const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
app.use(express.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

// Session
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 300000 },
  })
);

mongoose
  .connect(
    "mongodb+srv://oddworm:GLq5Dy_h9wArcH7@cluster0.wvsvveu.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log(" Success: Connected to MongoDB");
  })
  .catch((error) => {
    console.error(" Failure: Unconnected to MongoDB");
  });

const Schema = mongoose.Schema;
const BlogSchema = new Schema({
  title: String,
  summary: String,
  image: String,
  textBody: String,
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const BlogModel = mongoose.model("Blog", BlogSchema);
const UserModel = mongoose.model(" User", UserSchema); // 追加

app.post("/blog/create", (req, res) => {
  BlogModel.create(req.body, (error, savedBlogData) => {
    if (error) {
      console.log(" データ の 書き込み が 失敗 し まし た");
      res.send(" ブログデータ の 投稿 が 失敗 し まし た");
    } else {
      console.log(" データ の 書き込み が 成功 し まし た");
      res.send(" ブログデータ の 投稿 が 成功 し まし た");
    }
  });
});

// Read All Blogs
app.get("/", async (req, res) => {
  const allBlogs = await BlogModel.find();
  res.render("index", { allBlogs: allBlogs, session: req.session.userId });
});

app.get("/blog/create", (req, res) => {
  if (req.session.userId) {
    res.render("blogCreate");
  } else {
    res.redirect("/user/login");
  }
});

app.post("/blog/create", (req, res) => {
  BlogModel.create(req.body, (error, savedBlogData) => {
    if (error) {
      res.render("error", { message: "/blog/ create の エラー" });
    } else {
      res.redirect("/");
    }
  });
});

// Read Single Blog
app.get("/blog/:id", async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);

  res.render("blogRead", {
    singleBlog: singleBlog,
    session: req.session.userId,
  });
});

// Update Blog
app.get("/blog/update/:id", async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);

  res.render("blogUpdate", { singleBlog });
});

app.post("/blog/update/:id", (req, res) => {
  BlogModel.updateOne({ _id: req.params.id }, req.body).exec((error) => {
    if (error) {
      res.render("error", { message: "/blog/update の エラー" });
    } else {
      res.redirect("/");
    }
  });
});

// Delete Blog
app.get("/blog/delete/:id", async (req, res) => {
  const singleBlog = await BlogModel.findById(req.params.id);

  res.render("blogDelete", { singleBlog });
});

app.post("/blog/delete/:id", (req, res) => {
  BlogModel.deleteOne({ _id: req.params.id }).exec((error) => {
    if (error) {
      res.render("error", { message: "/blog/ delete の エラー" });
    } else {
      res.redirect("/");
    }
  });
});

// User function
// Create user
app.get("/user/create", (req, res) => {
  res.render("userCreate");
});

app.post("/user/create", (req, res) => {
  UserModel.create(req.body, (error, savedUserData) => {
    if (error) {
      res.render("error", { message: "/user/ create の エラー" });
    } else {
      res.redirect("/user/login");
    }
  });
});

// user Login
app.get("/user/login", (req, res) => {
  res.render("login");
});

app.post("/user/login", (req, res) => {
  UserModel.findOne({ email: req.body.email }, (error, savedUserData) => {
    if (savedUserData) {
      // ユーザー が 存在 し た 場合 の 処理
      if (req.body.password === savedUserData.password) {
        // パスワード が 正しい 場合 の 処理
        req.session.userId = savedUserData._id; // 追加

        res.redirect("/");
      } else {
        // パスワード が 間違っ て いる 場合 の 処理
        res.render("error", {
          message: "/user/login の エラー: パスワード が 間違っ て い ます",
        });
      }
    } else {
      // ユーザー が 存在 し て い ない 場合 の 処理
      res.render("error", {
        message: "/user/ login の エラー: ユーザー が 存在 し て い ませ ん",
      }); // 修正
    }
  });
});

const port = process.env.PORT || 5000; // 追加

app.listen(port, () => {
  console.log(` Listening on ${port}`);
});
