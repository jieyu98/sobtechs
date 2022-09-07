$(document).ready(function () {
    
    $("#tracing-form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#calculate-btn").click(function () {
        // Trivial check

        // Calculate trace success rate
        var base_rate = $("#successRate").val();
        
        if($("#fever").is(':checked')) { // Spell trace fever
            if (base_rate == 15) {
                base_rate = 25;
            } else if (base_rate == 30) {
                base_rate = 45;
            } else if (base_rate == 70) {
                base_rate = 95;
            } else {
                base_rate = 100;
            }
        }

        var dilli_lvl = $("#dilliLvl").val();
        var dilli_bonus = math.round(dilli_lvl/10);
        var guild_bonus_1 = $("#guildEnhancementLvl").val();
        var guild_bonus_2 = $("#guildSalvationLvl").val();
        var trace_rate = +base_rate + +dilli_bonus + +guild_bonus_1;

        var total_slots = $("#totalSlots").val();
        var success_count = $("#noOfSuccess").val();
        var fail_count = $("#noOfFails").val();
        var fail_count_trigger = $("#innoTrigger").val();
        var trace_cost = $("#traceCost").val();
        var inno_rate = $("#innoType").val();
        var css_type = $("#cssType").val();
        var css_rate;

        if(($("#fever").is(':checked')) && (inno_rate == 30)) { // Check if fever + using spell trace inno
            inno_rate = 45;
        }

        if(($("#fever").is(':checked')) && (css_type == 0)) { // Check if fever + using spell trace CSS
            css_rate = 10;
        } else if (css_type == 0) { // If select value == 0, we are using spell trace CSS
            css_rate = 5; 
        }

        var spell_trace_count = 0;
        var inno_count = 0;
        var css_count = 0;

        // Phase 1 (Trace until we are satisfied with the fail count)
        while ((total_slots - success_count - fail_count) > 0) { // Run while loop until no more slots left
            if (probability(trace_rate)) { // Pass
                spell_trace_count += +trace_cost;
                success_count++;
            } 
            else { // Failed
                // Guild upgrade salvation - When you fail a scroll or Spell Trace enhancement, there's a chance the upgrade count will not be consumed.
                if (probability(guild_bonus_2)) {
                    console.log("Saved");
                } else {
                    fail_count++;
                }

                
                if (fail_count >= fail_count_trigger) { // Inno time
                    // While loop, till inno passes
                    while (1) {
                        inno_count++;

                        if (inno_rate == 30 || inno_rate == 45) {
                            if ($("#discount").is(':checked')) {
                                spell_trace_count += 2500; // Need double check
                            } else {
                                spell_trace_count += 5000; // Need double check
                            }
                        }
                            
                        if (probability(inno_rate)) { // Inno pass
                            success_count = 0;
                            fail_count = 0;
                            break;
                        }
                    }
                }

                spell_trace_count += +trace_cost;
            }
        }

        console.log("Phase 1 results");
        console.log(success_count);
        console.log(fail_count);
        console.log(spell_trace_count);

        // Phase 2 (CSS + Perf trace remaining)
        while (success_count != total_slots) {
            if (total_slots - success_count - fail_count > 0) { // Trace if a slot exists

            } else { // Else apply CSS until one passes
                while (1) {
                    css_count++;

                    if(($("#discount").is(':checked')) && (css_type == 0)) {
                        spell_trace_count += 1000;
                    } else {
                        spell_trace_count += 2000;
                    }

                    if (probability(css_rate)) { // CSS pass
                        fail_count--;
                        break;
                    }
                }
            }
        }
        
    });

    // Function to test probability
    function probability(rate) {
        return math.random() < (rate/100);
    }

    // Phase 1 
})


