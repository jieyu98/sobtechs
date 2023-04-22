$(document).ready(function () {

    $("#cases-form").on('submit', function (e) {
        e.preventDefault();
    });

    function caseOdds(rarity, itemCount, numCases) {
        if (itemCount > numCases) {
            throw new Error('Item count cannot be greater than the number of cases.');
        }

        const rarityOdds = {
            'Navy Blue': 0.7992,
            'Purple': 0.1598,
            'Hot Pink': 0.032,
            'Red': 0.0064,
            'Gold': 0.0026
        };

        if (!(rarity in rarityOdds)) {
            throw new Error('Invalid rarity type provided.');
        }

        const probability = rarityOdds[rarity];

        let cumulativeProbability = 0;
        for (let i = itemCount; i <= numCases; i++) {
            cumulativeProbability += Math.exp(logCombination(numCases, i) + i * Math.log(probability) + (numCases - i) * Math.log(1 - probability));
        }

        return cumulativeProbability;

        function logCombination(n, r) {
            return logFactorial(n) - (logFactorial(r) + logFactorial(n - r));
        }

        function logFactorial(num) {
            let result = 0;
            for (let i = 2; i <= num; i++) {
                result += Math.log(i);
            }
            return result;
        }
    }

    $("#calculate-btn").click(function () {
        var rarity = $("#raritySelect").val();
        var itemCount = parseInt($("#noOfItemCount").val(), 10);
        var numCases = parseInt($("#noOfCases").val(), 10);

        try {
            const res = caseOdds(rarity, itemCount, numCases);

            const percentage = (res * 100).toFixed(2) + "%";

            const resultString = `Your odds of unboxing at least ${itemCount} ${rarity} skin(s) from ${numCases} cases is `;

            $('#results').text(resultString);
            $('#percentage').text(percentage);

        } catch (error) {
            alert(error.message);
        }
    });
})


