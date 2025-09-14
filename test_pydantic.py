#!/usr/bin/env python3
"""
Test script to debug the Pydantic model issue
"""

import sys
import os

# Add the python-agent src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

from pydantic import BaseModel, Field
from pydantic.v1 import BaseModel as V1BaseModel
from typing import Optional

# Test the model definitions
class GetProductInput(V1BaseModel):
    id: str = Field(description="Product ID to get details for")

class GetCartInput(V1BaseModel):
    userId: str = Field(description="User ID")

print("Pydantic models created successfully!")
print(f"GetProductInput: {GetProductInput}")
print(f"GetCartInput: {GetCartInput}")
print(f"BaseModel: {BaseModel}")
print(f"Is GetProductInput a subclass of BaseModel? {issubclass(GetProductInput, BaseModel)}")
print(f"Is GetCartInput a subclass of BaseModel? {issubclass(GetCartInput, BaseModel)}")

# Test StructuredTool import
try:
    from langchain.tools import StructuredTool
    print("StructuredTool imported successfully!")
    
    # Test creating a simple tool
    def test_func(id: str) -> str:
        return f"Test: {id}"
    
    tool = StructuredTool.from_function(
        func=test_func,
        name="test_tool",
        description="Test tool",
        args_schema=GetProductInput
    )
    print("StructuredTool created successfully!")
    
except Exception as e:
    print(f"Error creating StructuredTool: {e}")
    import traceback
    traceback.print_exc()
