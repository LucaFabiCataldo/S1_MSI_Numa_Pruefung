from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math

all_functions = [
    # 0) cosh(x) - 1
    ["cosh(x) - 1",
     "cosh(x) - 1",
     "sinh(x)",
     lambda x: math.cosh(x) - 1,
     lambda x: math.sinh(x),
     0
    ],

    # 1) tanh(x)
    ["tanh(x)",
     "tanh(x)",
     "1/(cosh(x)^2)",
     lambda x: math.tanh(x),
     lambda x: 1.0 / (math.cosh(x) ** 2),
     1
    ],

    # 2) x - cos(x)
    ["x - cos(x)",
     "x - cos(x)",
     "1 + sin(x)",
     lambda x: x - math.cos(x),
     lambda x: 1.0 + math.sin(x),
     2
    ],

    # 3) pi/2 - x - cos(x)
    ["pi/2 - x - cos(x)",
     "pi/2 - x - cos(x)",
     "-1 + sin(x)",
     lambda x: math.pi/2.0 - x - math.cos(x),
     lambda x: -1.0 + math.sin(x),
     3
    ],

    # 4) x - sin(x)
    ["x - sin(x)",
     "x - sin(x)",
     "1 - cos(x)",
     lambda x: x - math.sin(x),
     lambda x: 1.0 - math.cos(x),
     4
    ],

    # 5) x - exp(-x)
    ["x - exp(-x)",
     "x - exp(-x)",
     "1 + exp(-x)",
     lambda x: x - math.exp(-x),
     lambda x: 1.0 + math.exp(-x),
     5
    ],

    # 6) exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x
    ["exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x",
     "exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x",
     "-(1/x^2)*exp(1/x - 3/2) + 4x^3 + 24x^2 - 50/257",
     lambda x: math.exp(1.0/x - 1.5) + x**4 + 8*x**3 - (50.0/257.0)*x,
     lambda x: -(1.0/(x**2))*math.exp(1.0/x - 1.5) + 4*x**3 + 24*x**2 - 50.0/257.0,
     6
    ],

    # 7) Kx^(m+1) - (K+r)x^m + r   (Parameterfunktion)
    ["Parameterfunktion",
     "K*x^(m+1) - (K+r)*x^m + r",
     "K*(m+1)*x^m - (K+r)*m*x^(m-1)",
     lambda x, K=50000, r=1200, m=48: K*(x**(m+1)) - (K+r)*(x**m) + r,
     lambda x, K=50000, r=1200, m=48: K*(m+1)*(x**m) - (K+r)*m*(x**(m-1)),
     7
    ],

    # 8) Lagrange-Punkte Funktion
    ["Lagrange",
     "alpha*(s0 + 2*s0*x + (1+s0-s1)*x^2 + 2*x^3 + x^4) - x^2*((1-s1)+3*x+3*x^2+x^3)",
     "alpha*(2*s0 + 2*(1+s0-s1)*x + 6*x^2 + 4*x^3) - (2*x*g(x) + x^2*g'(x))",
     lambda x, alpha=1/332965, s0=-1, s1=1:
         alpha*(s0 + 2*s0*x + (1+s0-s1)*x**2 + 2*x**3 + x**4)
         - x**2*((1-s1) + 3*x + 3*x**2 + x**3),
     lambda x, alpha=1/332965, s0=-1, s1=1:
         alpha*(2*s0 + 2*(1+s0-s1)*x + 6*x**2 + 4*x**3)
         - (2*x*((1-s1)+3*x+3*x**2+x**3) + x**2*(3+6*x+3*x**2)),
     8
    ]
]


def calc_new_x_val(passed_slope, passed_y, last_x):
    if passed_slope == 0:
        raise ZeroDivisionError("Ableitung ist 0, Newton nicht möglich.")
    return last_x - passed_y / passed_slope


def calc_slope(passed_ableitung, x_val):
    calced_slope = passed_ableitung(x_val)
    return calced_slope

def calc_y_val(passed_function, passed_x_val):
    calced_y = passed_function(passed_x_val)
    return calced_y

def calcNewton(function, ableitung, start_val, num_iterations):
    iteration_array = []

    last_x_val = start_val

    for i in range(num_iterations):

        current_y = calc_y_val(function, last_x_val)
        current_slope = calc_slope(ableitung, last_x_val)
        new_x = calc_new_x_val(current_slope, current_y, last_x_val)

        current_iteration = [last_x_val, current_y, new_x, 0]
        iteration_array.append(current_iteration)

        last_x_val = new_x

    return iteration_array

app = FastAPI(title="Numerik Backend")

# -------------------------
# CORS (für React)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Test-Route
# -------------------------
@app.get("/")
def root():
    return {"message": "Backend läuft."}


# ------------------------------------------------
@app.get("/api/functions")
def get_functions():
    return all_functions
    
class NewtonRequest(BaseModel):
    f: str        # z.B. "x - cos(x)"
    df: str       # z.B. "1 + sin(x)"
    x0: float     # Startwert
    n: int        # Iterationen
    damping: float = 1.0
    num_f: int

@app.post("/api/newton")
def newton(req: NewtonRequest):
    print("f:", req.f)
    print("df:", req.df)
    print("x0:", req.x0, "n:", req.n, "damping:", req.damping)
    print(req.num_f)

    calced_iterations = calcNewton(all_functions[req.num_f][3], all_functions[req.num_f][4], req.x0, req.n)

    return calced_iterations
