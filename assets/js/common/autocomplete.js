class Autocomplete {

    constructor(boundElement, model, maxResults = 4) {
        this.boundElement = boundElement
        this.model = model
        this.autofill = {}
        this.maxResults = maxResults

        model.forEach(e => {
            for (let i = 0; i < e.length; i++) {
                const prefix = e.substring(0, i)
                if (prefix in this.autofill) {
                    this.autofill[prefix].add(e)
                }
                else {
                    this.autofill[prefix] = new Set([e])
                }
            }
        })

        this.boundElement.addEventListener("input", (e) => {
            this.renderSearch(e.target.value)
        })

        const autocompleteInputContainer = document.createElement("div")
        autocompleteInputContainer.className = "autocomplete-input-container"

        const autocompletePrompt = document.createElement("div")
        autocompletePrompt.className = "autocomplete-input-prompt"
        autocompletePrompt.innerHTML = ">&nbsp;"

        const autocompleteInput = document.createElement("span")
        autocompleteInput.contentEditable = true
        autocompleteInput.className = "autocomplete-input"

        autocompleteInputContainer.appendChild(autocompletePrompt)
        autocompleteInputContainer.appendChild(autocompleteInput)
        this.boundElement.appendChild(autocompleteInputContainer)
    }

    renderSearch(input) {
        const results = this.getResults(input)
        console.log(results)
        for (let i = 0; i < Math.min(this.maxResults, results.length); i++) {
            
            if (i == 0) {

            }
            const resultElement = document.createElement("div")
            resultElement.className = "autocomplete-result"
            resultElement.innerText = results[i]

            if (this.boundElement.children.length > i + 1) {  
                this.boundElement.replaceChild(resultElement, this.boundElement.children[i + 1])
            }
            else {
                this.boundElement.appendChild(resultElement)
            }
        }

        while (this.boundElement.children.length-1 > results.length) {
            this.boundElement.removeChild(this.boundElement.children[this.boundElement.children.length-1])
        }
    }

    getResults(prefix) {
        return prefix in this.autofill ? Array.from(this.autofill[prefix]) : []
    }
}

export { Autocomplete }