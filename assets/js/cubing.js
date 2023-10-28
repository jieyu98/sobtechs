$(document).ready(function () {
    // Load navbar
    $("#navbar").load("assets/components/navbar.html");

    $("#cubing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        var tiering_matrix = [
            [0.009901, 0, 0, 0], // Suspicious 0 
            [0.047619, 0.011858, 0, 0], // Yellow 1
            [0.079994, 0.016959, 0.001996, 0], // Purple 2
            [0.06, 0.018, 0.003, 0], // Red 3
            [0.15, 0.035, 0.012, 0], // Black 4
            [0.047619, 0.019608, 0.006, 0], // Additional 5
            [1, 1, 1, 0] // Test 6
        ];

        // Check if DMT is checked
        if ($("#DMT").is(':checked')) {
            tiering_matrix = math.multiply(tiering_matrix, 2);
        }

        var current_tier = $("#currentTierSelect").val();
        var desired_tier = $("#desiredTierSelect").val();

        // Basic checks
        var tier_val = current_tier - desired_tier;

        if (tier_val == 0) {
            alert("Please choose a different desired tier.");
            return;
        }

        if (tier_val > 0) {
            alert("Please choose a higher desired tier.");
            return;
        }

        // Get cube and number of cubes
        var cube_selected = $("#cubeSelect").val();
        var no_of_cubes = $("#noOfCubes").val();

        // Create transition matrix
        var transition_matrix = [...Array(4)].map(e => Array(4).fill(0));

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (i == j) { // Same tier (Failed)
                    transition_matrix[i][j] = 1 - tiering_matrix[cube_selected][i];
                }

                if (j == i + 1) { // One tier higher (Success)
                    transition_matrix[i][j] = tiering_matrix[cube_selected][i];
                }
            }
        }

        // Raise matrix to the power of number of cubes
        result_matrix = math.pow(transition_matrix, no_of_cubes);

        result_tier_chance = math.round(result_matrix[current_tier][desired_tier] * 100 * 100) / 100;

        $('#tierChance').text(result_tier_chance + '%');

        // Display result matrix
        if ($("#transitionMatrix").hasClass("d-none")) {
            $("#transitionMatrix").removeClass("d-none");
            $("#transitionMatrix").addClass("d-block");
        }

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                $('#' + i + j).text(math.round(result_matrix[i][j] * 100 * 100) / 100 + '%');

                // Remove previous highlight if any
                if ($('#' + i + j).hasClass("table-success"))
                    $('#' + i + j).removeClass("table-success");
            }
        }

        // Highlight cell
        $('#' + current_tier + desired_tier).addClass("table-success");

        $('#trials').text(no_of_cubes);

    });
})


