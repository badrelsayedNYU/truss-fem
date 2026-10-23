# Truss FEM Stepper

An interactive web tool that walks through the direct stiffness method for 2D and 3D bar/truss problems, one stage at a time. Built for ME-UY 4214 Finite Element Modeling (NYU Tandon), Bonus Assignment 1.

**Live tool:** https://badrelsayednyu.github.io/truss-fem/

## What it shows

| Stage | Content |
|---|---|
| 1. Problem | Truss drawing with DOF labels, supports and loads; node and element tables |
| 2. Element stiffness | Length, direction cosines, local stiffness AE/L, transformation matrix [T], λ and the numeric element [k] |
| 3. Global assembly | Local-to-global DOF map; [K] built one element at a time, with a breakdown of any entry on click |
| 4. Boundary conditions | Constrained and free DOFs, partitioned equations, reduced [K] and {F} |
| 5. Displacements | [K]{d} = {F} solved by Gaussian elimination, every row operation and the back substitution shown |
| 6. Reactions and stresses | Reactions from the supported rows, equilibrium check, axial strain, stress and force, tension or compression |

## Built-in problems

- Logan, *A First Course in the Finite Element Method*, Example 3.9 (3D space truss, 3 bars)
- Three-bar plane truss (2D)
- Five-bar braced panel (2D)

Any problem can be edited, or a new 2D/3D truss defined, from Stage 1.

## Verification (Logan Example 3.9)

| Quantity | Tool | Textbook |
|---|---|---|
| d1x (m) | 1.384×10⁻³ | 1.383×10⁻³ |
| d1z (m) | 6.015×10⁻⁵ | 6.015×10⁻⁵ |
| σ (MPa), bars 1 / 2 / 3 | 20.53 / 4.21 / −5.29 | 20.51 / 4.21 / −5.29 |

The small differences come from the textbook rounding direction-cosine products to three decimals.

## Running it

Open the live link, or download `index.html` and open it in any browser. Everything runs client-side in plain JavaScript. The only external dependency is MathJax (loaded from a CDN) for typesetting equations; without an internet connection the equations show as LaTeX source and all numbers still work.

The solver is the code between `/*CORE-START*/` and `/*CORE-END*/` in `index.html`: `analyze()` forms element matrices, assembles [K], applies boundary conditions and recovers reactions and stresses; `gaussSolve()` performs Gaussian elimination and records each step for display.
