class Rect {
    static #PRIVATE_STATIC_VALUE;
    #test;

    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.#test  = 42;
    }

    //публичный метод
    calcArea() {
        return this.height * this.width;
    }

    static publicStaticMethod() {
        Rect.#PRIVATE_STATIC_VALUE = 40;
        return Rect.#PRIVATE_STATIC_VALUE;
    }

    //статический метод
    static getConsole() {
        console.log('static');
        
    }

    //Приватный метод
    #privateMethod() {
        console.log('private');
    }

    get private() {
        this.#privateMethod();
        console.log(this);
    }

    // set height(val) {
    //     this.height = val;
    // }
}

//Наследование, всегда от 1 класса
class Square extends Rect {
    constructor(width) {
        super(width, width);
    }

    test() {
        console.log(this);
    }
} 

class plusDate extends Date {
    constructor() {
        super();
    }

    getLocalFormatedMonth() {
        var month = [
            'Январь', 'Февраль',
            'Март', 'Апрель',
            'Май', 'Июнь',
            'Июль', 'Август',
            'Сентябрь', 'Октябрь',
            'Ноябрь', 'Декабрь',
        ];

        return (
            this.getDate() + '/' + month[this.getMonth()] + '/' + this.getFullYear()
        )
    }
}

const st = new plusDate();
console.log(st.getLocalFormatedMonth());
const rect = new Rect(10, 20);
const rect2 = new Rect(3,9);
console.log(rect.calcArea());
console.log(rect2.calcArea());

//Приватный метод нельзя вызывать напрямую
//rect.#privateMethod();

rect.private;

Rect.getConsole();

const sqr = new Square(4);
console.log(sqr.calcArea());