"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var job_route_1 = __importDefault(require("./routes/job-route"));
dotenv_1["default"].config();
var PORT = process.env.PORT || 3000;
var app = (0, express_1["default"])();
app.use((0, cors_1["default"])());
app.use(express_1["default"].json());
app.use("/mmjobs/jobs", job_route_1["default"]);
app.listen(PORT, function () { return console.log("Server listening on port ".concat(PORT)); });
//# sourceMappingURL=index.js.map