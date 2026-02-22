
# 7) Kx^(m+1) - (K+r)x^m + r   (Parameterfunktion)
["Parameterfunktion",
    "K*x^(m+1) - (K+r)*x^m + r",
    "K*(m+1)*x^m - (K+r)*m*x^(m-1)",
    lambda x, K=50000, r=1200, m=48: K*(x**(m+1)) - (K+r)*(x**m) + r,
    lambda x, K=50000, r=1200, m=48: K*(m+1)*(x**m) - (K+r)*m*(x**(m-1)),
    7,
    0
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
    8,
    0
]
