$(document).ready(function () {
    
    $("#star-forcing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        // Trivial checks

        var equip_level = $("#itemLevel").val();
        var current_stars = $("#currentStars").val();
        var target_stars = $("#targetStars").val();
        var total_meso_cost = 0;

        while (current_stars != target_stars) {
            console.log("Meso cost:", raw_meso_cost(equip_level, current_stars));
            total_meso_cost += raw_meso_cost(equip_level, current_stars);

            tap_res = tap(current_stars);

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
        
        equip_level = math.round(equip_level/10) * 10; // Equip Level is rounded down to the nearest 10 levels.

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

        var temp = (math.pow(equip_level, 3)) * (math.pow((parseInt(current_stars) + 1), exponent)/constant) + 10;
        cost = math.round((temp*100)/100) * 100; // Meso cost is rounded off to the nearest hundreds. 

        return cost
    }

    function tap(current_stars) {
        success_rate = [95, 90, 85, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30, 30, 30, 30, 30, 30, 30, 3, 2, 1];
        
        rate = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 98, 98, 97, 97, 97, 96, 96, 90, 90, 80, 70, 60]
        
        console.log(current_stars);

        if (probability(success_rate[current_stars])) { // Success
            return "Pass";
        } else { // Failed
            // Check if maintain, decrease, or destroy

            const type_1_stars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]; // These types can only either maintain or destroy
            var type_1 = false;
            var type_2 = false;

            if (type_1_stars.includes(current_stars))
                type_1 = true;
            else 
                type_2 = true; // These types can only either decrease or destroy

            if (probability(rate[current_stars])) {
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
        return math.random() < (rate/100);
    }
})


