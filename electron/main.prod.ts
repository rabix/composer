import main = require("./src/main.common");

main.start({
    url: `file://${__dirname}/index.html`,
    devTools: false
});
