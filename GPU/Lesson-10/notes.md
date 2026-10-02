# 10 > Number Formats and Tensor Cores

Every number a GPU works on is stored in a fixed number of bits. This lesson shows how those bits are split up, walks through the formats in use today from FP64 down to 4-bit NVFP4, and explains the Tensor Cores that sit next to the regular CUDA cores and turn fewer bits into much more speed.

## How a Floating-Point Number Is Stored

A floating-point number is stored like scientific notation in base 2. It has three parts:

- The sign: 1 bit, 0 for positive and 1 for negative.
- The exponent: says how big the number is, the power of 2. It is stored with a bias, so negative powers fit without a sign of their own.
- The mantissa: the digits of the number, how precise it is. A normal number always starts with "1.", so that 1 is not stored. It is the hidden bit.

value = (−1)^sign × 2^(exponent − bias) × 1.mantissa

Worked example: 6.5 in FP32, which has 1 sign bit, 8 exponent bits, 23 mantissa bits and a bias of 127.

- 6.5 in binary is 110.1, which is 1.101 × 2^2.
- Sign: positive, so 0.
- Exponent: 2 + 127 = 129, which is 10000001 in binary.
- Mantissa: the digits after "1.", so 101 followed by 20 zeros.
- Stored bits: `0 10000001 10100000000000000000000`. Check: 2^(129 − 127) × 1.625 = 4 × 1.625 = 6.5.

6.5 is exact because 0.5 is a power of 2. Most decimal numbers are not.

> [!NOTE]
> 0.1 has no exact binary form, just like 1/3 has no exact decimal form. FP32 stores the nearest value it has, 0.100000001490116... Every format rounds; fewer mantissa bits means a bigger rounding error.

## Range and Precision

The bits of a format are shared between two jobs:

- More exponent bits give more range: how large and how small a number can be.
- More mantissa bits give more precision: how close neighbouring numbers are.

FP16 and BF16 both use 16 bits but split them differently. FP16 has 5 exponent bits and 10 mantissa bits. Its largest value is 65,504, so 70,000 becomes infinity. BF16 has 8 exponent bits, the same range as FP32 (up to about 3.4 × 10^38), but only 7 mantissa bits. So 1 + 1/512 = 1.001953125 is exact in FP16, while BF16 rounds it to 1, because its steps near 1 are 1/128 apart.

## The Formats

| Format | Bits (sign / exponent / mantissa) | Largest value | Main use |
|---|---|---|---|
| FP64 | 1 / 11 / 52 | ≈ 1.8 × 10^308 | science, simulation |
| FP32 | 1 / 8 / 23 | ≈ 3.4 × 10^38 | general GPU math on CUDA cores |
| TF32 | 1 / 8 / 10 | ≈ 3.4 × 10^38 | FP32 matrix math on Tensor Cores |
| FP16 | 1 / 5 / 10 | 65,504 | inference, older training |
| BF16 | 1 / 8 / 7 | ≈ 3.4 × 10^38 | training |
| FP8 E4M3 | 1 / 4 / 3 | 448 | inference, training forward pass |
| FP8 E5M2 | 1 / 5 / 2 | 57,344 | gradients in training |
| FP6 E2M3 / E3M2 | 1 / 2 / 3 or 1 / 3 / 2 | 7.5 or 28 | inference with block scaling |
| FP4 E2M1 | 1 / 2 / 1 | 6 | inference with block scaling |
| INT8 | 8-bit whole number | 127 (from −128) | quantized inference |

The names E4M3 and E5M2 just count the bits: 4 exponent bits and 3 mantissa bits, or 5 and 2. TF32 is FP32 with the mantissa cut to 10 bits. It still sits in a 32-bit register, but the Tensor Core only uses 19 bits of it. INT8 has no exponent at all: 256 evenly spaced whole numbers, multiplied by a scale factor chosen for each tensor or channel.

Pick a format and type a value. The cells show the sign, exponent and mantissa bits, and the table shows what is really stored and how big the rounding error is:

<num-formats></num-formats>

Where each one is used:

- Science and simulation (weather, chemistry, physics) need FP64, because tiny errors grow over millions of steps.
- Training AI models runs mostly in BF16, more and more in FP8, with FP32 kept for the master copy of the weights and for sums. Training needs range, because gradients can be very small.
- Inference, running a trained model, is where the smallest formats live: FP8, INT8 and now FP4. A trained model tolerates rounding much better than a training run.

## Block Scaling and NVFP4

FP4 E2M1 alone holds only 15 values: 0 and ±0.5, ±1, ±1.5, ±2, ±3, ±4, ±6. That is far too few on its own. NVFP4 fixes this with a shared scale factor: every block of 16 values shares one FP8 E4M3 number, and each value is stored as scale × its 4-bit element. The scale is chosen so that the largest value in the block lands near 6, the top of FP4, and a second FP32 scale covers the whole tensor. Worked example: if the largest value in a block is 0.1, the scale is 0.1 / 6 ≈ 0.0167, which E4M3 stores as 0.017578125, so 0.1 is stored as 0.017578125 × 6 = 0.10546875. Plain FP4 would have rounded 0.1 to 0. The cost is 8 extra bits per 16 values: 4 + 8 / 16 = 4.5 bits per value. MXFP4, the open format from the OCP, uses blocks of 32 with a power-of-2 scale instead.

## Worked Example: A 70-Billion-Parameter Model

A model's weights take parameters × bytes per parameter. For 70 billion parameters:

- FP16 or BF16, 2 bytes: 70 × 10^9 × 2 = 140 GB.
- FP8, 1 byte: 70 × 10^9 × 1 = 70 GB.
- FP4, half a byte: 70 × 10^9 × 0.5 = 35 GB. With the NVFP4 scales: 70 × 10^9 × 4.5 / 8 ≈ 39.4 GB.

The L40S has 48 GB. In FP16 the weights need at least 3 of them (140 / 48 ≈ 2.9). In FP8 they need 2 (70 / 48 ≈ 1.5). In NVFP4 the weights fit on one. But the L40S is Ada Lovelace: it has FP8 Tensor Cores, not FP4 ones. 4-bit weights would have to be converted to a wider format before the math. A Blackwell GPU, like the B200 or the RTX 5090, multiplies FP4 directly.

> [!WARNING]
> These numbers are the weights only. Running the model also needs memory for activations and for the KV cache, the stored keys and values of earlier tokens, which grows with batch size and prompt length.

## What Tensor Cores Are

A CUDA core does one FMA, a × b + c, on single numbers. A Tensor Core does a matrix multiply-accumulate on small tiles:

D = A × B + C

A and B are small matrices in a narrow format such as FP16 or FP8. C and D usually stay wider, often FP32, so the sum does not lose precision. The first Tensor Cores, in Volta, each did a 4 × 4 × 4 multiply-accumulate per clock: 4 × 4 × 4 = 64 FMAs, where a CUDA core does 1. In CUDA one warp (see [Lesson 08](../Lesson-08/notes.md)) issues the instruction together. One FP16 `mma` instruction with the shape m16n8k16 multiplies a 16 × 16 tile by a 16 × 8 tile: 16 × 8 × 16 = 2,048 multiply-adds for the whole warp.

Narrow formats are why Tensor Cores scale so well. A multiplier for fewer bits is smaller and moves less data, so the same chip fits more of them. On the L40S, going from FP16 to FP8 doubles the peak, as the datasheet table below shows.

## Which Architecture Added Which Format

Each Tensor Core generation added formats. The compute capability numbers in the CC column are from [Lesson 05](../Lesson-05/notes.md):

| Architecture | CC | Tensor Core gen | New formats |
|---|---|---|---|
| Volta (2017) | 7.0 | 1st | FP16 |
| Turing (2018) | 7.5 | 2nd | INT8, INT4 |
| Ampere (2020) | 8.0, 8.6 | 3rd | TF32, BF16, FP64, 2:4 sparsity |
| Hopper (2022) | 9.0 | 4th | FP8 |
| Ada Lovelace (2022) | 8.9 | 4th | FP8 |
| Blackwell (2024) | 10.x, 11.0, 12.x | 5th | FP6, FP4, NVFP4, MXFP8/6/4 |

2:4 sparsity means that in every group of 4 weights at least 2 are zero. The Tensor Core skips the zeros, so for weights pruned that way it does the same work in half the time.

## Tensor Cores and CUDA Cores on the L40S

NVIDIA's L40S datasheet gives these peaks. Dense is the normal case. Sparse needs 2:4 sparse weights:

| Unit and format | Dense | With sparsity |
|---|---|---|
| CUDA cores, FP32 | 91.6 TFLOPS | none |
| Tensor Cores, TF32 | 183 TFLOPS | 366 TFLOPS |
| Tensor Cores, FP16 / BF16 | 362 TFLOPS | 733 TFLOPS |
| Tensor Cores, FP8 | 733 TFLOPS | 1,466 TFLOPS |
| Tensor Cores, INT8 | 733 TOPS | 1,466 TOPS |

Dense FP16 on the Tensor Cores is 362 / 91.6 ≈ 4 times the FP32 peak of the CUDA cores, and dense FP8 is 733 / 91.6 ≈ 8 times. TFLOPS and TOPS are both peaks; TOPS counts integer operations.

> [!WARNING]
> Datasheets often show the sparse number first, marked with a small asterisk. The H100 SXM is listed at 3,958 TFLOPS of FP8, which is with sparsity; dense it is 1,979. Always compare dense with dense.

In the roofline from [Lesson 09](../Lesson-09/notes.md), each of these is a higher compute roof. With 864 GB/s, the FP8 roof moves the ridge point to 733,000 / 864 ≈ 848 FLOP per byte. Fewer bits help on the memory side too: an FP8 value is 1 byte instead of 4, so the same matrix moves 4 times fewer bytes.

## Why This Matters for CUDA

- Plain C++ `float` and `double` math runs on the regular FP32 and FP64 units, not on Tensor Cores. Narrow formats have their own types: `__half` in `cuda_fp16.h`, `__nv_bfloat16` in `cuda_bf16.h`, `__nv_fp8_e4m3` in `cuda_fp8.h`, `__nv_fp4_e2m1` in `cuda_fp4.h`.
- A kernel uses Tensor Cores through the WMMA API in `mma.h`, through PTX `mma` instructions, or through libraries like cuBLAS and CUTLASS that do it for you.
- The format must exist on your GPU's compute capability. On the L40S, compile with `-arch=sm_89` to get FP8 Tensor Core instructions; FP4 instructions need a Blackwell target.
- Always accumulate in a wider format than you multiply in. Summing thousands of FP16 products in FP16 loses digits fast.

## Summary

A floating-point number is a sign, an exponent for range and a mantissa for precision. Fewer bits mean less memory, less traffic and more Tensor Core throughput, but larger rounding errors. FP64 serves science, BF16 and FP8 serve training, and FP8, INT8 and NVFP4 serve inference, with block scaling making 4 bits usable. Tensor Cores compute D = A × B + C on small tiles, and each generation since Volta added narrower formats.

## Glossary

- GPU (Graphics Processing Unit): the processor this track is about, built from many cores that work in parallel.
- CUDA (Compute Unified Device Architecture): NVIDIA's platform for writing programs that run on its GPUs.
- floating-point number: a number stored as a sign, an exponent and a mantissa, like scientific notation in base 2.
- sign: the bit that says whether a number is positive (0) or negative (1).
- exponent: the bits that hold the power of 2, and so the range of a format.
- bias: a fixed number added to the exponent so that negative powers can be stored without a sign; 127 in FP32, 15 in FP16.
- mantissa: the bits that hold the digits of the number, and so its precision.
- hidden bit: the leading 1 of a normal number, which is not stored.
- range: how large and how small the numbers in a format can be.
- precision: how close neighbouring numbers in a format are, set by the mantissa bits.
- FP64 / FP32 / FP16 (64-, 32- and 16-bit floating point): 64-bit, 32-bit and 16-bit floating-point formats.
- BF16 (bfloat16, brain floating point): a 16-bit format with the range of FP32 and 7 mantissa bits.
- TF32 (TensorFloat-32): FP32 with a 10-bit mantissa, used by Tensor Cores for FP32 matrix math since Ampere.
- FP8 / E4M3 / E5M2: 8-bit floating point; E4M3 has 4 exponent and 3 mantissa bits, E5M2 has 5 and 2.
- FP6 / FP4 (6-bit / 4-bit floating point): 6-bit and 4-bit floating point, used with block scaling on Blackwell.
- NVFP4 (NVIDIA 4-bit floating point): FP4 E2M1 values with one FP8 E4M3 scale per block of 16 and one FP32 scale per tensor.
- MXFP4 (microscaling FP4): the open OCP (Open Compute Project) 4-bit format with blocks of 32 and a power-of-2 scale.
- OCP (Open Compute Project): an industry group that publishes open hardware standards, including the MX formats.
- block scaling / scale factor: one shared number per block of values that every value in the block is multiplied by.
- INT8 (8-bit integer): whole numbers from −128 to 127, used with a scale factor for inference.
- AI (artificial intelligence): software that learns from data, such as language models.
- training: teaching an AI model from data by adjusting its weights with gradients.
- inference: running a trained model to get answers.
- parameter / weights: the numbers a model learns; their count times bytes per number gives the memory they take.
- KV cache (key-value cache): the keys and values of earlier tokens that a language model keeps in memory during inference.
- Tensor Core: a unit that computes D = A × B + C on small matrix tiles in one instruction.
- CUDA core: a regular GPU core that does one FP32 FMA per clock.
- FMA (fused multiply-add): one instruction that computes a × b + c.
- warp: 32 threads that issue instructions together; a Tensor Core instruction is issued by a whole warp.
- 2:4 sparsity: weights with at least 2 zeros in every group of 4, which Tensor Cores can skip for up to 2 times the throughput.
- dense / sparse: a peak without sparsity, or the doubled peak that needs 2:4 sparse weights.
- FLOP (floating-point operation): one add, subtract, multiply or divide on floating-point numbers.
- TFLOPS / TOPS (tera floating-point operations per second / tera operations per second): trillions of floating-point operations, or integer operations, per second.
- compute capability (CC): NVIDIA's version number for what a GPU's hardware supports.
- ridge point: peak FLOPS divided by memory bandwidth; kernels with less arithmetic intensity are memory bound.
- WMMA (Warp Matrix Multiply-Accumulate): the CUDA C++ API in `mma.h` for using Tensor Cores from a kernel.
- PTX (Parallel Thread Execution): NVIDIA's low-level intermediate language that CUDA code compiles to.
