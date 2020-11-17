var requirejs = require('requirejs');
const AugmentTransitionSystem = requirejs("./src/ModelTransformation/augmentTransitionSystem.js");
const augment = new AugmentTransitionSystem;

console.log(augment);