'use strict';
//типы данных
//const, let, var

let ob = {}; // new Object(); - объект
let string = 'string'; //строка
let number = 1; // целое число
let float = 1.5; // число с плавающей точкой
let array = []; // new Array(); - массив

//специфические типы данных
// let date = new Date();
// let list = new NodeList();

//Развернутый объект
let ob2 = {
    name: 'Bob',
    age: 12,
    phone: '+79998887766'
};

//Развернутый массив
let array2 = [12, null, [], 'string'];

//Так делать нельзя
// array2[12] = 'bad';
// array2.name = 'vasya';

//Операции
let numberF = '2';
let string2 = string + string; // stringstring - конкатенация
let number2 = number + number; // 2 - сложение у чисел
let number3 = number + numberF; // 12 - конкатенация, число + строка

let ar1 = [1,2];
let ar2 = [2,4];

let ar3 = ar1 + ar2;

//*, /, ^, -, %, ?, - куча операторов

//Циклы
//Условные циклы
let num1 = 1;
let num2 = '1';
if(num1 == num2) { // условие равно но не идентично
    //console.log('true');
}

if(num1 === num2) {
    //console.log(true);
    let i = true;
}
else {
    //console.log(false)
    let i = false;
}

// let i = (num1 !== num2) ? true : false;
// let j = num1 == num2;

//==, ===, !=, !==, >, <, ||, >=, <=, <==, >==, %=, %==, %=%, <=>

let b = true;

if(!!b) {
    console.log()
}

switch(num1) {
    case '1': 
    //console.log(true);
    break;

    case 1: 
    //console.log(true);
    break;

    default: 
    //console.log('default');
    break;
}

try {

}
catch(error) {

}

//итераторы
let i = 1;
do {
    i++;
    //console.log(i);
    //делаем что то
} while(i < 3); //пока не закончит выполняться условие

let j = 1;
while(j < 3) {
    j++;
    //console.log(j);
}

//классический цикл for
for(let i = 0; i < ar1.length; i++) {
    //console.log(ar1[i]);
}

for(let value of ar1) { //только для массивов
    //console.log(value);
}

//console.log(ob2);
for(let key in ob2) {
    //console.log(key, '=>', ob2[key]);
}

//Функции
let func1 = function() {
    console.log('func1');
};

function func2() {
    console.log('f2');
}

function square(num) {
    return num*num;
}

function per(num) {
    return num*2;
}

// square(4);
// square(5);
// square(12);

let func3 = (value, method) => {
    console.log(method(value));
}

func3(3, square);
func3(3, per);