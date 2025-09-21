import express from "express";
import _ from "lodash";

const app = express();
console.log(_.shuffle([1, 2, 3]));
app.listen(3000, () => console.log("Server running"));
