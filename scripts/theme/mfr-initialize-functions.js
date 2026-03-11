const retryMfrPriorityFunctions = [];
const retryMfrFunctions = [];

function executeFunctions(functionArray,retryArray) {
  while (functionArray.length) {
    const func = functionArray.shift(); // Remove the first function from the array
    if (typeof func === "function") {
      try {
        func(); // Call the function
      } catch (error) {
        // If there's an error, add the function to the retry array
        retryArray.push(func);
        
      }
    }
  }
}

function initializeMFRFunctions($) {
  // Execute priority functions immediately
  executeFunctions(mfrPriorityFunctions, retryMfrPriorityFunctions);
  executeFunctions(mfrFunctions, retryMfrFunctions);

  onReady = (func) => {
    func();
  }
}

// Run the functions when the document is ready
document.addEventListener("DOMContentLoaded", initializeMFRFunctions);
window.addEventListener("load", () => {
  executeFunctions(retryMfrPriorityFunctions, []);
  executeFunctions(retryMfrFunctions, []);
});

// If Shopify sections are loaded dynamically, run the functions again
document.addEventListener("shopify:section:load", initializeMFRFunctions);
