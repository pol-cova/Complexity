from sympy import sympify, symbols
import re

def parse_function(function_str: str):
    # Ensure that the function has no invalid characters or missing operators
    # Replacing common issues like space between operators and operands
    function_str = re.sub(r'(?<=\d)(?=\w)', '*', function_str)  # e.g., 'z2' -> 'z*2'
    function_str = function_str.replace(" ", "")  # Remove any unnecessary spaces

    try:
        # Define the variable 'z'
        z = symbols('z')
        # Try to parse the function
        func = sympify(function_str)
        return func
    except Exception as e:
        raise ValueError(f"Invalid function expression: {function_str}. Error: {str(e)}")
