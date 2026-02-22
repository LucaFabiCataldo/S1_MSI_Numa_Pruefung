from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math


# -------------------------
# Funktionen (nur intern)
# -------------------------
all_functions = [
    # 0) cosh(x) - 1
    ["cosh(x) - 1",
     "cosh(x) - 1",
     "sinh(x)",
     lambda x: math.cosh(x) - 1,
     lambda x: math.sinh(x),
     0,
     0
    ],

    # 1) tanh(x)
    ["tanh(x)",
     "tanh(x)",
     "1/(cosh(x)^2)",
     lambda x: math.tanh(x),
     lambda x: 1.0 / (math.cosh(x) ** 2),
     1,
     0
    ],

    # 2) x - cos(x)
    ["x - cos(x)",
     "x - cos(x)",
     "1 + sin(x)",
     lambda x: x - math.cos(x),
     lambda x: 1.0 + math.sin(x),
     2,
     0.7390851332
    ],

    # 3) pi/2 - x - cos(x)
    ["pi/2 - x - cos(x)",
     "pi/2 - x - cos(x)",
     "-1 + sin(x)",
     lambda x: math.pi / 2.0 - x - math.cos(x),
     lambda x: -1.0 + math.sin(x),
     3,
     (math.pi/2)
    ],

    # 4) x - sin(x)
    ["x - sin(x)",
     "x - sin(x)",
     "1 - cos(x)",
     lambda x: x - math.sin(x),
     lambda x: 1.0 - math.cos(x),
     4,
     0
    ],

    # 5) x - exp(-x)
    ["x - exp(-x)",
     "x - exp(-x)",
     "1 + exp(-x)",
     lambda x: x - math.exp(-x),
     lambda x: 1.0 + math.exp(-x),
     5,
     0.5671432904
    ],

    # 6) exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x
    ["exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x",
     "exp(1/x - 3/2) + x^4 + 8x^3 - (50/257)x",
     "-(1/x^2)*exp(1/x - 3/2) + 4x^3 + 24x^2 - 50/257",
     lambda x: math.exp(1.0 / x - 1.5) + x**4 + 8*x**3 - (50.0 / 257.0) * x,
     lambda x: -(1.0 / (x**2)) * math.exp(1.0 / x - 1.5) + 4*x**3 + 24*x**2 - 50.0 / 257.0,
     6,
     0
    ],


    ["x^3",
    "x^3",
    "3*x^2",
    lambda x: x**3,
    lambda x: 3*x**2,
    7,
    0.0
    ],

    ["x^9",
    "x^9",
    "9*x^8",
    lambda x: x**9,
    lambda x: 9*x**8,
    8,
    0.0
    ],

    ["x^15",
    "x^15",
    "15*x^14",
    lambda x: x**15,
    lambda x: 15*x**14,
    9,
    0.0
    ],

    ["x^3+0.1",
    "x^3+0.1",
    "3*x^2",
    lambda x: x**3 + 0.1,
    lambda x: 3*x**2,
    10,
    0.0
    ],

    ["x^3-0.1",
    "x^3-0.1",
    "3*x^2",
    lambda x: x**3 - 0.1,
    lambda x: 3*x**2,
    11,
    0.0
    ],


]


# -------------------------
# Newton Kern
# -------------------------
def calc_new_x_val(passed_slope: float, passed_y: float, last_x: float, damping: float) -> float:
    # numerisch robust: "zu klein" statt "== 0"
    if abs(passed_slope) < 1e-12:
        raise ZeroDivisionError(f"Ableitung zu klein (Ist: {passed_slope}), Newton instabil.")

    print(f"damping: {damping}")

    # gedämpfter Newton-Schritt
    return last_x - damping * (passed_y / passed_slope)


def calcNewton(function, ableitung, start_val: float, num_iterations: int, damping: float):
    iteration_array = []
    last_x_val = start_val

    for i in range(num_iterations):
        # Werte berechnen
        current_y = function(last_x_val)
        current_slope = ableitung(last_x_val)

        print(f"Slope {i}: {current_slope}")

        # Finite-Check (NaN/Inf abfangen)
        if not (math.isfinite(current_y) and math.isfinite(current_slope) and math.isfinite(last_x_val)):
            raise ValueError("NaN/Inf entdeckt (Divergenz oder Domain-Problem).")

        new_x = calc_new_x_val(current_slope, current_y, last_x_val, damping)

        if not math.isfinite(new_x):
            raise ValueError("Neuer x-Wert ist NaN/Inf (Divergenz/Overflow).")

        # [x_n, f(x_n), x_{n+1}, 0] wie bei dir
        iteration_array.append([last_x_val, current_y, new_x, 0])
        last_x_val = new_x

    return iteration_array


# -------------------------
# FastAPI App
# -------------------------
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
# Models
# -------------------------
class NewtonRequest(BaseModel):
    # f/df sind bei dir nur für Anzeige/Logging, bleiben drin
    f: str
    df: str
    x0: float
    n: int = Field(ge=1, le=1000)
    damping: float = Field(default=1.0, ge=0.0, le=2.0)
    num_f: int = Field(ge=0, le=len(all_functions)-1)


# -------------------------
# Routes
# -------------------------
@app.get("/")
def root():
    return {"message": "Backend läuft."}


@app.get("/api/functions")
def get_functions():
    # WICHTIG: keine lambdas zurückgeben, nur serialisierbare Daten
    return [
        {"id": f[5], "name": f[0], "f": f[1], "df": f[2], "null": f[6]}
        for f in all_functions
    ]


@app.post("/api/newton")
def newton(req: NewtonRequest):
    try:
        # optionales Logging
        print("f:", req.f)
        print("df:", req.df)
        print("x0:", req.x0, "n:", req.n, "damping:", req.damping, "num_f:", req.num_f)

        return calcNewton(
            all_functions[req.num_f][3],
            all_functions[req.num_f][4],
            req.x0,
            req.n,
            req.damping
        )

    except (ZeroDivisionError, OverflowError, ValueError) as e:
        # kontrollierter Fehler (z.B. Ableitung ~ 0, Domain Error, Overflow)
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # unerwarteter Fehler
        raise HTTPException(status_code=500, detail=f"Unerwarteter Fehler: {e}")
