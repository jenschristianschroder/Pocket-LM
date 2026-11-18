# Santa’s Delivery Dilemma

Independent GitHub Pages demo at `/santa/`. All inference and visitor training run locally with no third-party scripts or services. Teaching data is held in memory for the tab session.

## Reproduce

From the repository root, run `node training/santa/train.mjs` to regenerate `santa/checkpoint.json` and `training/santa/report.json`. Run `node --test santa/model.test.mjs santa/ui.test.mjs` after `npm ci` to verify the network and interface.

The network has 5 normalized inputs (minutes until sunrise / 360, storm / 100, energy / 100, (gift width in cm - 10) / 90, (chimney width in cm - 10) / 90), a 24-unit tanh layer, and a four-class softmax output. Input values are rescaled to -1..1 inside the network. Its 244 parameters are trained by stochastic gradient descent on cross-entropy. Output order: chimney, front door, another house, rest.

All training situations are seeded, synthetic numeric vectors. An explicitly fictional utility function in the training script labels 5,000 examples; another seed produces 1,500 held-out evaluation examples. Report accuracy measures agreement with this synthetic policy, not objective delivery quality. The teacher function is never imported into the web app or copied to the deployed site. Runtime action selection is the argmax of the learned network's outputs, with no rule overrides.

Visitors can label at least eight examples and train a fresh network for 300 epochs entirely in their browser. Only their labels are used; the starter model is preserved for comparison. Training-set agreement is explicitly labeled and is not a generalization estimate. More diverse examples help; conflicting labels and unfamiliar inputs can produce poor choices.

The SVG artwork and interface were created for this demo. No external dataset, pretrained model, or human-authored creative corpus was used. Animations illustrate the selected action, not physical feasibility or success. The scene is keyboard accessible, responsive, and honors reduced-motion preferences.

## Christmas Eve challenge

The fixed route in `santa/mission.mjs` starts with eight children, 84 minutes and 75% energy. The unchanged starter checkpoint delivers to five children before sunrise. This is an observed consequence of its learned preferences, not a model-specific failure override. All models face identical simulation rules. Chimney attempts cost 6 minutes; door attempts cost 10; both consume 12% energy. Oversize chimney attempts fail. Below 12% energy a delivery/travel attempt fails and costs 6 minutes. Skipping costs 8 minutes and 6% energy, and leaves the child waiting. Resting costs 12 minutes and restores 45% energy up to 100%. Actions finishing at or after sunrise do not deliver. Storm conditions are inputs but have no additional simulation cost in this introductory level.

Practice route mode saves the exact state and the user's chosen action on each turn. No labels are supplied automatically. Visitors train the existing 5–24–4 network from their examples and run the same route autonomously. Runs snapshot the selected model and lock free-practice controls until completion or exit. Decision logs let visitors review situations and label corrections. Scores describe the latest run; retraining invalidates My Santa's displayed prior score. Data remains tab-local.

`node --test santa/model.test.mjs santa/mission.test.mjs santa/ui.test.mjs` checks baseline failure, simulator consequences and deadline boundaries, skipped-child revisits, and an actual train-and-run success. Nine practice decisions (chimney, door, chimney, door, chimney, door, rest, chimney, door) train a fresh model that delivers to all eight with eight minutes remaining. This is a fixed-route learning challenge, not evidence of generalization to unseen routes.
