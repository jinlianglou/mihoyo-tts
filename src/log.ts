export default class Logger {
    static instances = {};
    identifier: string;
    backgroundColor: string;
    static getInstance(identifier: string): CustomLogger {
        if (!Logger.instances[identifier]) {
            Logger.instances[identifier] = new CustomLogger(identifier);
        }
        return Logger.instances[identifier];
    }

    log(message: string) {
        console.log(message);
    }

    info(message: string) {
        console.info(message);
    }

    // 自定义表格输出
    printTable(data: Object) {
        console.log(`%c${this.identifier} [TABLE]: start --------------------------------------`, `background: ${this.backgroundColor}; color: white;`);
        for (const key in data) {
            console.log(`%c${key}: ${data[key]}`, `background: ${this.backgroundColor}; color: white;`);
        }
        console.log(`%c${this.identifier} [TABLE]: end --------------------------------------`, `background: ${this.backgroundColor}; color: white;`);
    }
}


class CustomLogger extends Logger {
    constructor(identifier: string) {
        super();
        this.identifier = identifier;
        this.backgroundColor = this.getRandomColor();
    }

    getRandomColor() {
        let color: string;
        do {
            const letters = '0123456789ABCDEF';
            color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
        } while (this.isExcludedColor(color));
        return color;
    }

    isExcludedColor(color: string) {
        const excludedColors = ['#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#C0C0C0', '#B0B0B0', '#A0A0A0', '#909090', '#808080'];
        return excludedColors.includes(color);
    }

    log(message: string) {
        console.log(`%c${this.identifier} [LOG]: ${message}`, `background: #4CAF50; color: white;`); // 背景绿色
    }

    info(message: string) {
        console.info(`%c${this.identifier} [INFO]: ${message}`, `background: #2196F3; color: white;`); // 背景蓝色
    }

    warn(message: string) {
        console.warn(`%c${this.identifier} [WARN]: ${message}`, `background: #FF9800; color: white;`); // 背景橘色
    }

    error(message: string) {
        console.error(`%c${this.identifier} [ERROR]: ${message}`, `background: #F44336; color: white;`); // 背景红色
    }

    // 使用自定义的 printTable 方法
    printTable(data: Object) {
        super.printTable(data);
    }
}