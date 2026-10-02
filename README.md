![Supported by JetBrains](https://img.shields.io/badge/Supported%20by-JetBrains-000000?logo=jetbrains&logoColor=white)
![Supported by Manning Publications](https://img.shields.io/badge/Supported%20by-Manning%20Publications-8B0000)
![Pull Shark](https://img.shields.io/badge/Pull%20Shark-x2-0075ca)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-db61a2?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/moezdil)

# CUDA, step by step

**Read it as a website → [moezdil.github.io/CUDA](https://moezdil.github.io/CUDA/)**

Learn how a GPU works, then write CUDA code. Short lessons in plain English, with interactive diagrams you can play with.

This repo documents my own path of learning CUDA from scratch. It builds intuition for how GPUs really work before writing code, and connects CUDA to real systems such as Kubernetes and AI workloads. Every lesson tries to answer one question: "Do I actually understand what is happening?"

## What is inside

| Track | Folder | Lessons | What you learn |
|---|---|---|---|
| 01 GPU Fundamentals | [`GPU/`](GPU) | 16 | What a GPU is, architectures and chips, memory bandwidth, compute capability, white papers, and how to set up a machine for CUDA |
| 02 CUDA Practice | [`cuda/`](cuda) | 10 | Your first kernels, blocks and threads, built-in variables, warps, compiling on Linux, vector addition, grid sizing and timing, with real output from an NVIDIA L40S |

Every lesson is one `notes.md` file. Each lesson has:

- plain-English explanations, with the reason behind every step
- code, commands and real program output, each explained line by line
- Note and Hint boxes for side information
- a glossary of the terms it uses
- interactive diagrams on the website (launch configurations, warps, memory bandwidth, the nvcc pipeline and more)

## The website

The site is built from this repo with [MkDocs](https://www.mkdocs.org/) and a custom theme. Every push to `main` rebuilds it and publishes it on GitHub Pages.

| Path | What it does |
|---|---|
| `mkdocs.yml` | Site settings and the lesson menu |
| `theme/main.html` | The page layout |
| `theme/assets/styles.css` | The whole design, dark and light |
| `theme/assets/site.js` | Page behavior and the CUDA diagrams |
| `theme/assets/gpu.js` | The GPU diagrams |
| `.github/workflows/pages.yml` | Builds and publishes the site |

### Run it locally

```bash
pip install "mkdocs<2" pymdown-extensions pygments
mkdir -p docs && cp -r GPU cuda manning.png manning.jpeg docs/ && cp README.md docs/index.md
mkdocs serve
```

Then open http://127.0.0.1:8000/CUDA/. The build copies the lessons into `docs/`, so run the copy line again after you edit a lesson.

### Add a lesson

1. Create `GPU/Lesson-NN/notes.md` or `cuda/Lesson-NN/notes.md`.
2. Add one line for it under `nav` in `mkdocs.yml`, for example `- "10 Shared Memory": cuda/Lesson-10/notes.md`. The two digits at the start become the lesson number on the site.
3. Push to `main`. The site updates by itself.

Inside a lesson you can use:

- Note and Hint boxes, written the GitHub way:

  ```markdown
  > [!NOTE]
  > Side information.

  > [!TIP]
  > A practical hint.
  ```

- Diagram tags on their own line, for example `<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>`. All tags are defined in `theme/assets/site.js` and `theme/assets/gpu.js`. GitHub does not show them, only the website does.
- A `## Glossary` section at the end, as a list of `- term: definition` lines. The site turns it into term cards.

## Support this project

These lessons and diagrams are free. If they helped you, you can support the work on **[GitHub Sponsors](https://github.com/sponsors/moezdil)**. Every sponsorship, even a small one, keeps new lessons coming.

## Sponsorship

<p align="left">
  <a href="https://www.jetbrains.com/"><img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg" width="120" alt="JetBrains"></a>
</p>

This project is supported by JetBrains. I use JetBrains tools every day for CUDA development, experiments and documentation.

<p align="left">
  <a href="https://www.manning.com/"><img src="manning.png" width="140" alt="Manning Publications"></a>
  <a href="https://www.manning.com/"><img src="manning.jpeg" width="98" alt="Manning Publications"></a>
</p>

This project is also supported by Manning Publications. Their technical books help me go deeper into CUDA, GPU systems and parallel computing. Special thanks to Manning for providing *CUDA for Deep Learning* by Elliot Arledge.
