// not used anywhere, just handy to get all modules

function listAllModuleCodes(candidates) {
  var moduleCodes = {};
  candidates.forEach((candidate) => {
    for (var moduleCode in candidate.modules) {
      if (moduleCodes.hasOwnProperty(moduleCode)) {
        moduleCodes[moduleCode] += 1;
      } else {
        moduleCodes[moduleCode] = 1;
      }
    }
  });
  return moduleCodes;
}
