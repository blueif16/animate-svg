# Audio & Captions Plan — kp2-counting-by-tens

| Cue ID | Narration | Caption | Est. Narration (s) | Budget (s) | Delta (s) | Gap (s) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `intro` | 我们来数十吧！ | 我们来数十吧！ | 2.1 | 2.0 | +0.1 | 0.5 |
| `bundle-recall` | 看，这一捆就是一个十。 | 看，这一捆就是一个十。 | 3.0 | 2.5 | +0.5 | 0.5 |
| `untie-reveal` | 打开它，里面有十个一。 | 打开它，里面有十个一。 | 3.0 | 3.0 | 0.0 | 0.5 |
| `slow-count-ones` | 要是我们一根一根地数，得数十次呢。 | 要是我们一根一根地数，得数十次呢。 | 4.8 | 5.0 | -0.2 | — |
| `fast-vs-slow` | 把它们捆起来，只要数一次就行啦！ | 把它们捆起来，只要数一次就行啦！ | 4.5 | 4.0 | +0.5 | 1.5 |
| `two-tens` | 看，又来一捆，这就是两个十。 | 看，又来一捆，这就是两个十。 | 3.6 | 3.0 | +0.6 | 0.5 |
| `three-tens` | 再添一捆，数数看，三个十。 | 再添一捆，数数看，三个十。 | 3.3 | 3.0 | +0.3 | 0.5 |
| `recap` | 发现了吗？一捆一捆地数，真的更快呢！ | 发现了吗？一捆一捆地数，真的更快呢！ | 4.8 | 4.0 | +0.8 | 2.0 |

**ASR Risk Note:** High risk of CJK token collapse in `slow-count-ones` ("一根一根") and `recap` ("一捆一捆"); proposed mitigation is to re-word to "慢慢地数，要数十次。" and "这样地数，更快一些。" respectively if ASR matchScore falls below 0.8.
