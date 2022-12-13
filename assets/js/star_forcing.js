$(document).ready(function () {
    $("#sim-form").on('submit', function (e) {
        e.preventDefault();
    });

    var sim_equip_lvl = 200; // Default equipment level is 200
    var sim_starting_stars = 0;
    var sim_meso_budget = 0;
    var sim_mvp_grade = "None";
    var sim_psc = "No";
    var sim_total_cost = 0;

    function initialize_sim() {
        $('#sim-current-stars').text(sim_starting_stars);
        $('#sim-next-stars').text(sim_starting_stars + 1);
        $('#sim-cost').text(raw_meso_cost(sim_equip_lvl, sim_starting_stars).toLocaleString("en-US"));
        $('#sim-total-cost').text(sim_total_cost);

        res = get_probabilities(sim_starting_stars);

        update_sim_display(res, sim_starting_stars);
    }

    // Start simulator
    initialize_sim();

    $("#sim-apply-settings-btn").click(function () {
        // TODO: TRIVIAL CHECKS

        sim_equip_lvl = $("#sim-equip-lvl").val();
        sim_starting_stars = parseInt($("#sim-starting-stars").val());
        sim_total_cost = 0;

        if ($("#cancel-star-catch").is(':checked')) {
            $("#cancel-star-catch").prop('checked', false); // Unchecks it
        }

        if ($("#anti-boom").is(':checked')) {
            $('#anti-boom').prop('checked', false); // Unchecks it
        }

        initialize_sim();
    });

    var decrease_count = 0;

    $('#anti-boom').change(function () { 
        var current_stars = $('#sim-current-stars').text();
        var cur_enhance_cost = raw_meso_cost(sim_equip_lvl, current_stars);

        if ($("#anti-boom").is(':checked')) {
            // Double the displayed meso cost
            $('#sim-cost').text((cur_enhance_cost * 2).toLocaleString("en-US"));
        }
        else {
            $('#sim-cost').text(cur_enhance_cost.toLocaleString("en-US"));
        } 
    });

    $("#sim-enhance-btn").click(async function () {
        $('#sim-enhance-btn').prop('disabled', true); // Disable button

        play_sound("enchant");

        var current_stars = $('#sim-current-stars').text();
        var next_stars = $('#sim-next-stars').text();
        var cur_enhance_cost = raw_meso_cost(sim_equip_lvl, current_stars);

        await delay(1000);

        // Check if "CANCEL STAR CATCH" is ticked
        if ($("#cancel-star-catch").is(':checked'))
            tap_res = tap(current_stars, false, decrease_count);
        else 
            tap_res = tap(current_stars, true, decrease_count);

        if (tap_res == "Pass") {
            decrease_count = 0;

            $('#sim-current-stars').text(parseInt(current_stars) + 1);
            $('#sim-next-stars').text(parseInt(next_stars) + 1);

            $("#sim-success-image").fadeIn("fast", function () {
                $("#sim-success-image").fadeOut(1000);
            });

            play_sound("success");
        } else if (tap_res == "Decrease") {
            decrease_count++;

            $('#sim-current-stars').text(parseInt(current_stars) - 1);
            $('#sim-next-stars').text(parseInt(next_stars) - 1);

            $("#sim-fail-image").fadeIn("fast", function () {
                $("#sim-fail-image").fadeOut(1000);
            });

            play_sound("fail");
        } else if (tap_res == "Maintain") {
            decrease_count = 0;

            $("#sim-fail-image").fadeIn("fast", function () {
                $("#sim-fail-image").fadeOut(1000);
            });

            play_sound("fail");
        } else if (tap_res == "Destroyed") {
            decrease_count = 0;

            $("#sim-destroyed-image").fadeIn("fast", function () {
                // $("#sim-fail-image").fadeOut(1000);
            });

            play_sound("destroyed");
        }

        // Check if anti-boom is checked AND valid ()
        if ($("#anti-boom").is(':checked') && current_stars >= 12 && current_stars <= 16) { // Here current_stars is the old one (before update)
            cur_enhance_cost = cur_enhance_cost * 2;
        } 

        current_stars = $('#sim-current-stars').text(); // Update to new current_stars

        if (decrease_count == 2) {
            res = [100, false, false, false]; // Chance time
        } else {
            res = get_probabilities(current_stars);
        }
        
        update_sim_display(res, current_stars); // Update probabilities displayed

        sim_total_cost += parseInt(cur_enhance_cost);

        var next_enhance_cost = raw_meso_cost(sim_equip_lvl, current_stars);

        // Update and display cost (of next enhancement)
        if ($("#anti-boom").is(':checked') && current_stars >= 12 && current_stars <= 16)
            $('#sim-cost').text((next_enhance_cost * 2).toLocaleString("en-US"));
        else 
            $('#sim-cost').text(next_enhance_cost.toLocaleString("en-US"));

        $('#sim-total-cost').text(sim_total_cost.toLocaleString("en-US")); // Update and display total cost

        $('#sim-result').text(tap_res); // Display result

        $('#sim-enhance-btn').prop('disabled', false); // Enable button
    });

    function play_sound(sound) {
        // Stop any ongoing sounds
        $('audio').each(function () {
            this.pause(); // Stop playing
            this.currentTime = 0; // Reset time
        });

        if (sound == "enchant") {
            $('audio#enchant-sound')[0].play()
        } else if (sound == "success") {
            $('audio#success-sound')[0].play()
        } else if (sound == "fail") {
            $('audio#fail-sound')[0].play()
        } else if (sound == "destroyed") {
            $('audio#destroyed-sound')[0].play()
        }
    }

    function delay(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    function update_sim_display(res, current_stars) {
        $('#sim-fail-rate').text("");
        $('#sim-destroy-rate').text("");
        $("#warning-1").css("display", "none");
        $("#warning-2").css("display", "none");
        $("#warning-3").css("display", "none");
        $("#warning-chance-time").css("display", "none");
        
        if (res[0] != false) { // Success rate
            $('#sim-success-rate').text("Success: " + math.round(res[0], 1) + "%");
        }

        if (res[1] != false) { // Maintain rate
            $('#sim-fail-rate').text("Fail (Maintain): " + math.round(res[1], 1) + "%");
        }

        if (res[2] != false) { // Decrease rate
            $('#sim-fail-rate').text("Fail (Decrease): " + math.round(res[2], 1) + "%");
        }

        if (res[3] != false) { // Destroy rate
            $('#sim-destroy-rate').text("Destroy: " + math.round(res[3], 1) + "%");
        }

        // Update warnings
        if (decrease_count == 2) {
            $("#warning-chance-time").css("display", "block");
        } else {
            if ((current_stars >= 0) && (current_stars < 11)) {
                $("#warning-1").css("display", "block");
            } else if (current_stars == 11) {
                $("#warning-2").css("display", "block");
            } else {
                $("#warning-3").css("display", "block");
            }
        }

        // Check if "ANTI-DESTRUCTION" option should be enabled or disabled
        if (current_stars >= 12 && current_stars <= 16) {
            $('#anti-boom').prop('disabled', false);
        } else {
            $('#anti-boom').prop('disabled', true);
        }
    }

    function get_probabilities(star) {
        const success_array = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30, 30, 30, 30, 30, 30, 30, 3, 2, 1];
        const maintain_array = [5, 10, 15, 15, 20, 25, 30, 35, 40, 45, 50, false, false, false, false, 67.9, false, false, false, false, 63, false, false, false, false];
        const decrease_array = [false, false, false, false, false, false, false, false, false, false, false, 55, 59.4, 63.7, 68.6, false, 67.9, 67.9, 67.2, 67.2, false, 63, 77.6, 68.6, 59.4];
        const destroy_array = [false, false, false, false, false, false, false, false, false, false, false, false, 0.6, 1.3, 1.4, 2.1, 2.1, 2.1, 2.8, 2.8, 7, 7, 19.4, 29.4, 39.6]

        var success_rate = false;
        var maintain_rate = false;
        var decrease_rate = false;
        var destroy_rate = false;

        success_rate = success_array[star];
        maintain_rate = maintain_array[star];
        decrease_rate = decrease_array[star];
        destroy_rate = destroy_array[star];

        return [success_rate, maintain_rate, decrease_rate, destroy_rate];
    }

    ////////////////

    $("#star-forcing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        // Trivial checks

        var equip_level = $("#itemLevel").val();
        var current_stars = $("#currentStars").val();
        var target_stars = $("#targetStars").val();
        var total_meso_cost = 0;
        var temp;
        var star_catch;

        // Check if star catch is enabled
        temp = $("#starCatch").val()
        if (temp == 0)
            star_catch = true;
        else
            star_catch = false;

        while (current_stars != target_stars) {
            console.log("Meso cost:", raw_meso_cost(equip_level, current_stars));
            total_meso_cost += raw_meso_cost(equip_level, current_stars);

            tap_res = tap(current_stars, star_catch);

            if (tap_res == "Pass") {
                current_stars++;
            } else if (tap_res == "Decrease") {
                current_stars--;
            } else if (tap_res == "Maintain") {
                console.log("Maintained");
            }
        }

        console.log("Finished. Final stars: ", current_stars);
        console.log("Total mesos used: ", total_meso_cost);
        $('#tierChance').text(total_meso_cost.toLocaleString("en-US"));
    });

    // Function to calculate raw meso cost
    function raw_meso_cost(equip_level, current_stars) {
        equip_level = math.round(equip_level / 10) * 10; // Equip Level is rounded down to the nearest 10 levels.

        var cost;
        var exponent;
        var constant;

        if (0 <= current_stars && current_stars < 10) {
            exponent = 1;
            constant = 2500;
        } else if (10 <= current_stars && current_stars < 15) {
            exponent = 2.7;
            constant = 40000;
        } else if (15 <= current_stars && current_stars < 25) {
            exponent = 2.7
            constant = 20000;
        }

        var temp = (math.pow(equip_level, 3)) * (math.pow((parseInt(current_stars) + 1), exponent) / constant) + 10;
        cost = math.round((temp * 100) / 100) * 100; // Meso cost is rounded off to the nearest hundreds. 

        return cost
    }

    function tap(current_stars, star_catch, count) {
        // Chance time
        if (count == 2) {
            console.log("Tap - Chance time activated");
            decrease_count = 0; // Reset
            return "Pass";
        }

        const success_rate_array = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30, 30, 30, 30, 30, 30, 30, 3, 2, 1];

        const rate_array = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 98, 98, 97, 97, 97, 96, 96, 90, 90, 80, 70, 60];

        var success_rate;

        if (star_catch)
            success_rate = (success_rate_array[current_stars]) * 1.05;
        else
            success_rate = success_rate_array[current_stars];

        if (probability(success_rate)) { // Success
            return "Pass";
        } else { // Failed
            // Check if maintain, decrease, or destroy

            const type_1_stars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]; // These types can only either maintain or destroy
            var type_1 = false;
            var type_2 = false;

            if (type_1_stars.includes(parseInt(current_stars)))
                type_1 = true;
            else
                type_2 = true; // These types can only either decrease or destroy

            if (probability(rate_array[current_stars])) {
                if (type_1)
                    return "Maintain";
                if (type_2)
                    return "Decrease";
            } else { // Destroyed
                return "Destroyed";
            }
        };
    }

    // Function to test probability
    function probability(rate) {
        return math.random() < (rate / 100);
    }
})


