// State variables
let currentInput = '0';
let previousInput = null;
let operator = null;
let awaitingNextValue = false;
let memory = 0;
let isRadians = false;
let stack = [];

// DOM Elements
const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const buttonsContainer = document.querySelector('.buttons');

// Update display
function updateDisplay() {
    let displayValue = currentInput;
    if (displayValue.length > 10) {
        let num = parseFloat(displayValue);
        if (!isNaN(num)) {
            displayValue = num.toPrecision(6).toString();
        }
    }
    display.textContent = displayValue;
}

// Get display symbol for operator
function getDisplayOperator(op) {
    switch (op) {
        case '/': return '&divide;';
        case '*': return '&times;';
        case '-': return '&minus;';
        case '+': return '+';
        case 'power': return '^';
        case 'yroot': return ' yroot ';
        case 'ee': return 'E';
        default: return op;
    }
}

// Update history display
function updateHistory() {
    if (operator && previousInput !== null) {
        historyDisplay.innerHTML = `${previousInput} ${getDisplayOperator(operator)}`;
    } else {
        historyDisplay.innerHTML = '';
    }
}

// Clear active operator highlights
function clearActiveOperators() {
    document.querySelectorAll('.btn-orange').forEach(btn => btn.classList.remove('active-operator'));
}

// Highlight active operator
function highlightOperator(op) {
    clearActiveOperators();
    // Find button with data-op = op
    const btn = document.querySelector(`.btn[data-op="${op}"]`);
    if (btn) btn.classList.add('active-operator');
}

// Handle Number Input
function handleNumber(num) {
    // If we were waiting for next value (after operator), verify state
    if (awaitingNextValue) {
        currentInput = num;
        awaitingNextValue = false;
        // Keep operator highlighted until we finish? Use standard behavior
        // iOS clears highlight on number press usually.
        clearActiveOperators();
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else {
            if (num === '.' && currentInput.includes('.')) return;
            currentInput += num;
        }
    }
    updateDisplay();
}

// Factorial Function
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// Unary Operations
function handleUnary(action) {
    let val = parseFloat(currentInput);
    if (isNaN(val)) return;

    switch (action) {
        case 'sign': val = val * -1; break;
        case 'percent': val = val / 100; break;
        case 'square': val = Math.pow(val, 2); break;
        case 'cube': val = Math.pow(val, 3); break;
        case 'exp': val = Math.exp(val); break;
        case 'ten-power': val = Math.pow(10, val); break;
        case 'inverse': val = 1 / val; break;
        case 'sqrt': val = Math.sqrt(val); break;
        case 'cbrt': val = Math.cbrt(val); break;
        case 'ln': val = Math.log(val); break;
        case 'log10': val = Math.log10(val); break;
        case 'factorial': val = factorial(val); break;
        case 'sin': val = isRadians ? Math.sin(val) : Math.sin(val * Math.PI / 180); break;
        case 'cos': val = isRadians ? Math.cos(val) : Math.cos(val * Math.PI / 180); break;
        case 'tan': val = isRadians ? Math.tan(val) : Math.tan(val * Math.PI / 180); break;
        case 'sinh': val = Math.sinh(val); break;
        case 'cosh': val = Math.cosh(val); break;
        case 'tanh': val = Math.tanh(val); break;
        case 'rand': val = Math.random(); break;
    }
    currentInput = val.toString();
    awaitingNextValue = true;
    updateDisplay();
}

// Constants
function handleConstant(constName) {
    if (constName === 'pi') currentInput = Math.PI.toString();
    if (constName === 'e') currentInput = Math.E.toString();
    if (constName === 'rand') currentInput = Math.random().toString();
    awaitingNextValue = true;
    updateDisplay();
}

// Handle Binary Operators
function handleOperator(op) {
    if (operator && !awaitingNextValue) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    awaitingNextValue = true;
    updateHistory();
    highlightOperator(op);
}

// Calculate
function calculate() {
    if (previousInput === null || operator === null) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result = 0;

    // Handle binary scientific ops
    if (operator === 'power') {
        result = Math.pow(prev, current);
    } else if (operator === 'yroot') {
        result = Math.pow(prev, 1 / current);
    } else if (operator === 'ee') {
        result = prev * Math.pow(10, current);
    } else {
        switch (operator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': result = current === 0 ? 'Error' : prev / current; break;
        }
    }

    currentInput = result.toString();
    operator = null;
    previousInput = null;
    awaitingNextValue = true;
    clearActiveOperators();
    updateHistory();
    updateDisplay();
}

// Memory
function handleMemory(action) {
    const val = parseFloat(currentInput);
    switch (action) {
        case 'memory-clear': memory = 0; break;
        case 'memory-add': memory += val; break;
        case 'memory-sub': memory -= val; break;
        case 'memory-recall':
            currentInput = memory.toString();
            awaitingNextValue = true;
            updateDisplay();
            break;
    }
}

// Event Delegation (Single Listener)
buttonsContainer.addEventListener('click', (e) => {
    // Find closest button parent incase click was on a span/text
    const button = e.target.closest('.btn');
    if (!button) return;

    const action = button.dataset.action;
    const num = button.dataset.num;
    const op = button.dataset.op;

    if (num !== undefined) handleNumber(num);

    if (action === 'clear') {
        currentInput = '0';
        previousInput = null;
        operator = null;
        awaitingNextValue = false;
        stack = [];
        clearActiveOperators();
        updateHistory();
        updateDisplay();
    }

    if (action === 'decimal') handleNumber('.');
    if (action === 'calculate') calculate();
    if (action === 'operator') handleOperator(op);

    if (['power', 'yroot', 'ee'].includes(action)) handleOperator(action);

    if (['sign', 'percent', 'square', 'cube', 'exp', 'ten-power', 'inverse', 'sqrt', 'cbrt', 'ln', 'log10', 'factorial', 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'].includes(action)) {
        handleUnary(action);
    }

    if (['pi', 'e', 'rand'].includes(action)) handleConstant(action);
    if (['memory-clear', 'memory-add', 'memory-sub', 'memory-recall'].includes(action)) handleMemory(action);

    if (action === 'rad') {
        isRadians = !isRadians;
        button.textContent = isRadians ? 'Deg' : 'Rad';
    }

    if (action === 'paren-left') {
        stack.push({ prev: previousInput, op: operator });
        previousInput = null;
        operator = null;
        awaitingNextValue = false;
        clearActiveOperators();
    }
    if (action === 'paren-right') {
        if (stack.length > 0) {
            calculate();
            const innerResult = currentInput;
            const popped = stack.pop();
            previousInput = popped.prev;
            operator = popped.op;
            currentInput = innerResult;
            calculate();
        }
    }
});

// Keyboard Support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/\d/.test(key)) {
        event.preventDefault();
        handleNumber(key);
    }

    if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        handleOperator(key);
    }

    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }

    if (key === '.') {
        event.preventDefault();
        handleNumber('.');
    }

    if (key === 'Backspace') {
        event.preventDefault();
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }

    if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        currentInput = '0';
        previousInput = null;
        operator = null;
        awaitingNextValue = false;
        stack = [];
        clearActiveOperators();
        updateHistory();
        updateDisplay();
    }

    if (key === '(') {
        event.preventDefault();
        stack.push({ prev: previousInput, op: operator });
        previousInput = null;
        operator = null;
        awaitingNextValue = false;
        clearActiveOperators();
    }
    if (key === ')') {
        event.preventDefault();
        if (stack.length > 0) {
            calculate();
            const innerResult = currentInput;
            const popped = stack.pop();
            previousInput = popped.prev;
            operator = popped.op;
            currentInput = innerResult;
            calculate();
        }
    }
});
