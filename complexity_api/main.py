from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from visualizer import generate_animation
from utils import parse_function

app = FastAPI()

@app.get("/")
async def home():
    return {"message": "Welcome to the Complex Function Visualizer API"}

@app.get("/visualize")
async def visualize(function: str = Query(..., description="Complex function as input (e.g., z**2 + 1)")):
    try:
        # Basic input validation
        if len(function) > 100:  # Prevent extremely long expressions
            raise ValueError("Function expression too long")
        
        # Check for potentially dangerous operations
        dangerous_terms = ['while', 'for', 'import', 'exec', 'eval']
        if any(term in function.lower() for term in dangerous_terms):
            raise ValueError("Invalid function expression: contains forbidden terms")
        
        # Parse the function expression
        parsed_function = parse_function(function)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        # Generate animation in memory
        video = generate_animation(parsed_function)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating visualization: {str(e)}")
    
    return StreamingResponse(video, media_type="video/mp4", headers={"Content-Disposition": "attachment; filename=visualization.mp4"})