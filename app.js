// Aura Smart Home Dashboard - Interactive Scripting

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Clock and Date System
    // -------------------------------------------------------------------------
    function updateClock() {
        const now = new Date();

        // Time with AM/PM
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // convert 0 to 12
        const hoursStr = String(hours).padStart(2, "0");

        const timeString = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
        document.getElementById("clock-time").textContent = timeString;

        // Date formatting: Sunday, 17 Sept 2026
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        document.getElementById("clock-date").textContent = now.toLocaleDateString('en-US', options);
    }

    updateClock();
    setInterval(updateClock, 1000);

    // -------------------------------------------------------------------------
    // 2. Room Switcher & Background Crossfade
    // -------------------------------------------------------------------------
    const roomTabs = document.querySelectorAll(".tab-btn");
    const roomViews = document.querySelectorAll(".room-view");
    const bgLayers = [
        document.getElementById("bg-layer-1"),
        document.getElementById("bg-layer-2")
    ];
    let currentBgLayerIndex = 0;
    let activeRoomKey = "living-room"; // Keep track of active room

    const roomBackgrounds = {
        "living-room": "assets/living_bg.png",
        "kitchen": "assets/kitchen_bg.png",
        "bedroom": "assets/bedroom_bg.png",
        "nursery": "assets/nursery_bg.png",
        "laundry": "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    };

    function changeRoom(roomKey) {
        activeRoomKey = roomKey;

        // Toggle tab buttons
        roomTabs.forEach(tab => {
            if (tab.dataset.room === roomKey) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });

        // Toggle room views
        roomViews.forEach(view => {
            if (view.id === `view-${roomKey}`) {
                view.classList.add("active");
            } else {
                view.classList.remove("active");
            }
        });

        // Sidebar highlight: camera btn for My Home, home btn for regular rooms
        const navHome = document.getElementById("btn-nav-home");
        const navCameras = document.getElementById("btn-nav-cameras");
        if (navHome && navCameras) {
            if (roomKey === "security-center") {
                navCameras.classList.add("active");
                navHome.classList.remove("active");
            } else {
                navHome.classList.add("active");
                navCameras.classList.remove("active");
            }
        }

        // Crossfade background
        const nextBgImage = roomBackgrounds[roomKey];
        if (nextBgImage) {
            const currentLayer = bgLayers[currentBgLayerIndex];
            const nextLayerIndex = (currentBgLayerIndex + 1) % 2;
            const nextLayer = bgLayers[nextLayerIndex];

            // Set the image on the hidden layer first
            nextLayer.style.backgroundImage = `url('${nextBgImage}')`;

            // Swap active classes (CSS transition handles opacity crossfade)
            nextLayer.classList.add("active");
            currentLayer.classList.remove("active");

            currentBgLayerIndex = nextLayerIndex;
        }
    }

    roomTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.dataset.room) {
                changeRoom(tab.dataset.room);
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. Navigation Sidebar Button Selection
    // -------------------------------------------------------------------------
    const navButtons = document.querySelectorAll(".sidebar-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Only handle navigation for Home and Cameras
            if (btn.id === "btn-nav-home" || btn.id === "btn-nav-cameras") {
                navButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                if (btn.id === "btn-nav-home") {
                    // Switch back to the active room view
                    roomViews.forEach(view => {
                        if (view.id === `view-${activeRoomKey}`) {
                            view.classList.add("active");
                        } else {
                            view.classList.remove("active");
                        }
                    });

                    // Restore active room tab highlight
                    roomTabs.forEach(tab => {
                        if (tab.dataset.room === activeRoomKey) {
                            tab.classList.add("active");
                        } else {
                            tab.classList.remove("active");
                        }
                    });
                } else if (btn.id === "btn-nav-cameras") {
                    // Show security center / My Home
                    roomViews.forEach(view => {
                        if (view.id === "view-security-center") {
                            view.classList.add("active");
                        } else {
                            view.classList.remove("active");
                        }
                    });

                    // Activate the My Home tab
                    roomTabs.forEach(tab => {
                        if (tab.dataset.room === "security-center") {
                            tab.classList.add("active");
                        } else {
                            tab.classList.remove("active");
                        }
                    });

                    activeRoomKey = "security-center";
                }
            } else {
                // For other buttons (stats, settings), just show visual active selection
                navButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            }
        });
    });

    // -------------------------------------------------------------------------
    // 4. Device Toggle Controllers
    // -------------------------------------------------------------------------
    const toggles = document.querySelectorAll(".toggle-control");

    toggles.forEach(toggle => {
        toggle.addEventListener("change", (e) => {
            const targetId = toggle.dataset.target;
            const targetWidget = document.getElementById(targetId);

            if (targetWidget) {
                if (toggle.checked) {
                    targetWidget.classList.add("active");
                } else {
                    targetWidget.classList.remove("active");
                }

                // Trigger sub-logic updates for specific widgets
                updateWidgetStatusText(targetId, toggle.checked);
            }
        });
    });

    function updateWidgetStatusText(id, isChecked) {
        // Living Room updates
        if (id === "widget-living-ac") {
            const statusAc = document.getElementById("status-living-ac");
            if (isChecked) {
                let status = "Cooling";
                if (typeof livingAcVal !== 'undefined') {
                    if (livingAcVal > 24.0) status = "Heating";
                    else if (livingAcVal > 21.0) status = "Fan Only";
                }
                statusAc.textContent = status;
            } else {
                statusAc.textContent = "Off";
            }
        }
        else if (id === "widget-living-lamp") {
            const lampSliderVal = document.getElementById("slider-living-lamp").value;
            const lampIcon = document.getElementById("living-lamp-icon");
            if (isChecked) {
                const glowOpacity = lampSliderVal / 100;
                const glowSize = 20 + (lampSliderVal / 100 * 40);
                lampIcon.style.textShadow = `0 0 ${glowSize}px rgba(255,183,0,${glowOpacity})`;
                lampIcon.style.opacity = Math.max(0.2, glowOpacity);
            } else {
                lampIcon.style.textShadow = "none";
                lampIcon.style.opacity = "0.2";
            }
        }
        else if (id === "widget-living-router") {
            document.getElementById("status-living-router-text").textContent = isChecked ? "212 kWh • Connected" : "Disconnected";
            const routerNetworkInfo = document.getElementById("router-network-info");
            const routerLeds = document.getElementById("router-leds");
            const routerImg = document.getElementById("router-img");
            if (routerNetworkInfo) routerNetworkInfo.style.opacity = isChecked ? "1" : "0.3";
            if (routerLeds) routerLeds.style.opacity = isChecked ? "1" : "0";
            if (routerImg) routerImg.style.opacity = isChecked ? "1" : "0.5";
        }
        else if (id === "widget-living-speaker") {
            document.getElementById("status-living-speaker-text").textContent = isChecked ? "Amazon Echo • Lofi Beats" : "Off";
            const speakerDisc = document.getElementById("speaker-disc");
            if (speakerDisc) speakerDisc.style.animationPlayState = isChecked ? "running" : "paused";
        }
        else if (id === "widget-living-tv") {
            const standby = document.querySelector("#widget-living-tv .tv-glow-indicator");
            if (standby) {
                standby.style.background = isChecked ? "var(--accent-green)" : "var(--accent-orange)";
                standby.style.boxShadow = isChecked ? "0 0 5px var(--accent-green)" : "0 0 5px var(--accent-orange)";
            }
            const tvScreen = document.getElementById("tv-screen-img");
            if (tvScreen) tvScreen.style.opacity = isChecked ? "1" : "0.1";
        }

        // Kitchen updates
        else if (id === "widget-kitchen-fridge") {
            document.getElementById("val-fridge-temp").style.opacity = isChecked ? "1" : "0.3";
            document.getElementById("val-freezer-temp").style.opacity = isChecked ? "1" : "0.3";
        }
        else if (id === "widget-kitchen-dishwasher") {
            document.getElementById("status-dishwasher-text").textContent = isChecked ? "Heavy Cycle • 35 mins left" : "Off";
        }
        else if (id === "widget-kitchen-purifier") {
            document.getElementById("status-purifier-text").textContent = isChecked ? "Filter Good • Running" : "Standby";
        }
        else if (id === "widget-kitchen-oven") {
            const statusText = document.getElementById("status-kitchen-oven-text");
            const ovenGlow = document.getElementById("oven-glow-window");
            const dialInfo = document.getElementById("status-kitchen-oven");
            if (isChecked) {
                statusText.textContent = `Preheating • ${document.getElementById("val-kitchen-oven").textContent}C`;
                if (ovenGlow) ovenGlow.style.opacity = "1";
                if (dialInfo) dialInfo.textContent = "Preheating";
            } else {
                statusText.textContent = "Off";
                if (ovenGlow) ovenGlow.style.opacity = "0.2";
                if (dialInfo) dialInfo.textContent = "Off";
            }
        }

        // Bedroom updates
        else if (id === "widget-bedroom-ac") {
            const statusText = document.getElementById("status-bedroom-ac");
            const acLed = document.getElementById("ac-led-bedroom");
            if (isChecked) {
                statusText.textContent = "Cooling";
                if (acLed) acLed.style.opacity = "1";
            } else {
                statusText.textContent = "Off";
                if (acLed) acLed.style.opacity = "0";
            }
        }
        else if (id === "widget-bedroom-lights") {
            // Unused since we removed data-target to stop the parent widget from turning off entirely
            document.getElementById("bedroom-color-bar").style.opacity = isChecked ? "1" : "0.3";
        }
        else if (id === "widget-bedroom-speaker") {
            document.getElementById("status-bedroom-audio").textContent = isChecked ? "Amazon Echo • Lofi Beats" : "Off";
            const speakerDisc = document.getElementById("speaker-disc-bedroom");
            if (speakerDisc) {
                speakerDisc.style.animationPlayState = isChecked ? "running" : "paused";
                speakerDisc.style.opacity = isChecked ? "1" : "0.5";
            }
        }
        else if (id === "widget-bedroom-tv") {
            const tvChannel = document.getElementById("val-tv-channel");
            document.getElementById("status-bedroom-tv-text").textContent = isChecked ? `Netflix • ${tvChannel ? tvChannel.textContent : "CH 04"}` : "Inactive";
            const tvScreen = document.querySelector("#tv-screen-bedroom .tv-glow-indicator");
            if (tvScreen) tvScreen.style.opacity = isChecked ? "0" : "1";
        }

        // Nursery updates
        else if (id === "widget-nursery-humidifier") {
            const humValue = document.querySelector("#widget-nursery-humidifier .sensor-value");
            humValue.textContent = isChecked ? "50%" : "--";
        }
        else if (id === "widget-nursery-sound") {
            const playBtn = document.getElementById("btn-nursery-play");
            if (!isChecked) {
                playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`; // Pause / Play icon
                soundPlaying = false;
            }
        }

        // Laundry updates
        else if (id === "widget-laundry-washer") {
            document.getElementById("status-washer-mode").textContent = isChecked ? "Washing" : "Off";
            document.getElementById("val-washer-time").textContent = isChecked ? "45m" : "--";
            document.querySelector("#widget-laundry-washer .dial-progress").style.strokeDashoffset = isChecked ? 150 : 377;
        }
        else if (id === "widget-laundry-dryer") {
            document.getElementById("status-dryer-mode").textContent = isChecked ? "Drying" : "Off";
            document.getElementById("val-dryer-time").textContent = isChecked ? "1h 20m" : "--";
            document.querySelector("#widget-laundry-dryer .dial-progress").style.strokeDashoffset = isChecked ? 220 : 377;
        }
        else if (id === "widget-laundry-iron") {
            document.getElementById("status-iron-text").textContent = isChecked ? "Heating • 150°C" : "Off";
        }
        else if (id === "widget-laundry-steam") {
            document.getElementById("status-steam-text").textContent = isChecked ? "Refresh Cycle • On" : "Off";
        }
        else if (id === "widget-laundry-robot") {
            document.getElementById("status-robot-text").textContent = isChecked ? "Active • Folding" : "Docked • 100%";
        }
        else if (id === "widget-laundry-light") {
            document.getElementById("status-laundry-light-text").textContent = isChecked ? "Bright White • On" : "Off";
        }

        updateSummaryBanner();
    }

    // -------------------------------------------------------------------------
    // 5. Dynamic Summary Banner calculation
    // -------------------------------------------------------------------------
    function updateSummaryBanner() {
        // Count active lights
        let activeLights = 0;
        if (document.getElementById("widget-living-lamp").classList.contains("active")) activeLights += 1;
        if (document.getElementById("widget-bedroom-lights").classList.contains("active")) activeLights += 4; // represent grouping
        if (document.getElementById("widget-nursery-lights").classList.contains("active")) activeLights += 5;
        if (document.getElementById("widget-nursery-nightlight").classList.contains("active")) activeLights += 3;
        if (document.getElementById("widget-laundry-light") && document.getElementById("widget-laundry-light").classList.contains("active")) activeLights += 2;

        const lightsBanner = document.getElementById("banner-lights-status");
        lightsBanner.textContent = activeLights > 0 ? `${activeLights} Lights On` : "All Lights Off";

        // Calculate climate summary
        let climateActive = false;
        let temps = [];
        if (document.getElementById("widget-living-ac").classList.contains("active")) {
            climateActive = true;
            temps.push(parseFloat(document.getElementById("val-living-ac").textContent));
        }
        if (document.getElementById("widget-bedroom-ac").classList.contains("active")) {
            climateActive = true;
            temps.push(parseFloat(document.getElementById("val-bedroom-ac").textContent));
        }

        const climateBanner = document.getElementById("banner-climate-status");
        if (climateActive && temps.length > 0) {
            const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
            climateBanner.textContent = `Climate Systems On (${avg}°C Avg)`;
        } else {
            climateBanner.textContent = "Climate Systems Off";
        }
    }

    // -------------------------------------------------------------------------
    // 6. SVG Circular Dials
    // -------------------------------------------------------------------------
    const CIRCUMFERENCE = 377; // 2 * Math.PI * 60

    function setDialProgress(progressCircle, valText, statusText, val, min, max, unit, statusMsg, isOven = false) {
        // Map value to angle / stroke-dashoffset
        const ratio = (val - min) / (max - min);
        const offset = CIRCUMFERENCE - (ratio * CIRCUMFERENCE);

        progressCircle.style.strokeDashoffset = offset;
        valText.textContent = `${val.toFixed(isOven ? 0 : 1)}${unit}`;

        if (statusText && statusMsg) {
            statusText.textContent = statusMsg;
        }
    }

    // A. Living Room AC (Range: 16.0 to 30.0)
    let livingAcVal = 16.0;
    const progressLivingAc = document.getElementById("progress-living-ac");
    const valLivingAc = document.getElementById("val-living-ac");
    const statusLivingAc = document.getElementById("status-living-ac");
    const svgLivingAc = document.getElementById("svg-living-ac");

    function updateLivingAc(val) {
        livingAcVal = Math.max(16.0, Math.min(30.0, val));
        let status = "Cooling";
        if (livingAcVal > 24.0) status = "Heating";
        else if (livingAcVal > 21.0) status = "Fan Only";

        setDialProgress(progressLivingAc, valLivingAc, statusLivingAc, livingAcVal, 16.0, 30.0, "°", status);

        // Update Summary
        updateSummaryBanner();
    }
    updateLivingAc(livingAcVal);

    document.getElementById("btn-living-ac-up").addEventListener("click", () => updateLivingAc(livingAcVal + 0.5));
    document.getElementById("btn-living-ac-down").addEventListener("click", () => updateLivingAc(livingAcVal - 0.5));

    // B. Bedroom AC (Range: 16.0 to 30.0)
    let bedroomAcVal = 21.0;
    const progressBedroomAc = document.getElementById("progress-bedroom-ac");
    const valBedroomAc = document.getElementById("val-bedroom-ac");
    const statusBedroomAc = document.getElementById("status-bedroom-ac");
    const svgBedroomAc = document.getElementById("svg-bedroom-ac");

    function updateBedroomAc(val) {
        bedroomAcVal = Math.max(16.0, Math.min(30.0, val));
        let status = "Cooling";
        if (bedroomAcVal > 24.0) status = "Heating";
        else if (bedroomAcVal > 22.0) status = "Auto";

        setDialProgress(progressBedroomAc, valBedroomAc, statusBedroomAc, bedroomAcVal, 16.0, 30.0, "°", status);
        updateSummaryBanner();
    }
    updateBedroomAc(bedroomAcVal);

    document.getElementById("btn-bedroom-ac-up").addEventListener("click", () => updateBedroomAc(bedroomAcVal + 0.5));
    document.getElementById("btn-bedroom-ac-down").addEventListener("click", () => updateBedroomAc(bedroomAcVal - 0.5));

    // C. Kitchen Oven (Range: 50 to 250)
    let ovenTarget = 180;
    let ovenActual = 100;
    const progressKitchenOven = document.getElementById("progress-kitchen-oven");
    const valKitchenOven = document.getElementById("val-kitchen-oven");
    const statusKitchenOven = document.getElementById("status-kitchen-oven");
    const svgKitchenOven = document.getElementById("svg-kitchen-oven");

    function updateOven(val) {
        ovenTarget = Math.max(50, Math.min(250, val));
        updateOvenDialDisplay();
    }

    function updateOvenDialDisplay() {
        let status = "Preheating";
        if (Math.abs(ovenActual - ovenTarget) < 3) {
            status = "Ready";
            ovenActual = ovenTarget;
        }
        setDialProgress(progressKitchenOven, valKitchenOven, statusKitchenOven, ovenActual, 50, 250, "°C", status, true);
    }
    updateOven(ovenTarget);

    document.getElementById("btn-kitchen-oven-up").addEventListener("click", () => updateOven(ovenTarget + 5));
    document.getElementById("btn-kitchen-oven-down").addEventListener("click", () => updateOven(ovenTarget - 5));

    // Simulate Oven heating up to set target
    setInterval(() => {
        if (ovenActual < ovenTarget) {
            ovenActual += Math.min(2.5, ovenTarget - ovenActual);
            updateOvenDialDisplay();
        } else if (ovenActual > ovenTarget) {
            ovenActual -= Math.min(2.5, ovenActual - ovenTarget);
            updateOvenDialDisplay();
        }
    }, 1500);

    // -------------------------------------------------------------------------
    // 7. Interactive Dials Angle Drag Handling
    // -------------------------------------------------------------------------
    function setupDialDrag(svgElement, valueUpdateFn, min, max) {
        let isDragging = false;

        function handleCoords(clientX, clientY) {
            const rect = svgElement.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            // Calculate angle from 12 o'clock (top) clockwise
            let angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
            angle += 90; // Align with top starting point
            if (angle < 0) angle += 360;

            // map 0..360 to min..max
            const fraction = angle / 360;
            const newValue = min + (fraction * (max - min));
            valueUpdateFn(newValue);
        }

        svgElement.addEventListener("mousedown", (e) => {
            isDragging = true;
            handleCoords(e.clientX, e.clientY);
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            handleCoords(e.clientX, e.clientY);
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

        // Touch support
        svgElement.addEventListener("touchstart", (e) => {
            isDragging = true;
            if (e.touches.length > 0) {
                handleCoords(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        window.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            if (e.touches.length > 0) {
                handleCoords(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        window.addEventListener("touchend", () => {
            isDragging = false;
        });
    }

    setupDialDrag(svgLivingAc, updateLivingAc, 16.0, 30.0);
    setupDialDrag(svgBedroomAc, updateBedroomAc, 16.0, 30.0);
    setupDialDrag(svgKitchenOven, updateOven, 50, 250);

    // -------------------------------------------------------------------------
    // 8. Fridge Target Selector
    // -------------------------------------------------------------------------
    const fridgeSlider = document.getElementById("slider-fridge-set");
    const fridgeLabel = document.getElementById("label-fridge-set");

    fridgeSlider.addEventListener("input", (e) => {
        const val = e.target.value;
        fridgeLabel.textContent = `${val}°C`;
        document.getElementById("val-fridge-temp").textContent = `${val}°C`;
    });

    // -------------------------------------------------------------------------
    // 9. Kitchen Brightness Slider
    // -------------------------------------------------------------------------
    const kitchenBrightSlider = document.getElementById("slider-kitchen-brightness");
    const kitchenBrightLabel = document.getElementById("val-kitchen-brightness");
    const iosBrightnessFill = document.getElementById("ios-brightness-fill");

    kitchenBrightSlider.addEventListener("input", (e) => {
        kitchenBrightLabel.textContent = `${e.target.value}%`;
        if (iosBrightnessFill) {
            iosBrightnessFill.style.width = `${e.target.value}%`;
        }
    });

    // -------------------------------------------------------------------------
    // 10. Bedroom Color Bar Picker & Smart Lights Toggle
    // -------------------------------------------------------------------------
    const colorBar = document.getElementById("bedroom-color-bar");
    const colorIndicator = document.getElementById("bedroom-color-indicator");
    const bedroomLightsWidget = document.getElementById("widget-bedroom-lights");
    const toggleBedroomLights = document.getElementById("toggle-bedroom-lights");
    const bedBrightnessSlider = document.getElementById("slider-bedroom-brightness");
    const bedBrightnessLabel = document.getElementById("label-bedroom-brightness");
    
    let isColorDragging = false;

    if (toggleBedroomLights) {
        toggleBedroomLights.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            if (colorBar) colorBar.style.opacity = isChecked ? "1" : "0.3";
            if (bedroomLightsWidget) {
                if (!isChecked) {
                    bedroomLightsWidget.style.boxShadow = "none";
                    bedroomLightsWidget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                } else {
                    // Trigger slider event to restore brightness glow
                    if (bedBrightnessSlider) {
                        bedBrightnessSlider.dispatchEvent(new Event("input"));
                    } else {
                        // Fallback
                        const currentColor = colorIndicator ? colorIndicator.style.backgroundColor : 'hsl(60, 100%, 50%)';
                        bedroomLightsWidget.style.borderColor = currentColor || 'var(--accent-yellow)';
                        bedroomLightsWidget.style.boxShadow = `0 0 20px ${currentColor || 'var(--accent-yellow)'}`;
                    }
                }
            }
        });
    }

    function handleColorPick(clientX) {
        const isLightsOn = toggleBedroomLights ? toggleBedroomLights.checked : true;
        if (!isLightsOn) return;

        const rect = colorBar.getBoundingClientRect();
        let posX = clientX - rect.left;
        posX = Math.max(0, Math.min(rect.width, posX));

        const percentage = posX / rect.width;
        colorIndicator.style.left = `${percentage * 100}%`;

        // Map percentage to HSL Hue
        const hue = percentage * 360;
        const colorString = `hsl(${hue}, 100%, 50%)`;

        // Update color indicator color and widget shadow based on brightness
        colorIndicator.style.backgroundColor = colorString;
        
        // Let the brightness slider update the shadow
        if (bedBrightnessSlider) {
            bedBrightnessSlider.dispatchEvent(new Event("input"));
        } else {
            bedroomLightsWidget.style.borderColor = colorString;
            bedroomLightsWidget.style.boxShadow = `0 0 20px ${colorString}`;
        }
    }

    colorBar.addEventListener("mousedown", (e) => {
        isColorDragging = true;
        handleColorPick(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
        if (!isColorDragging) return;
        handleColorPick(e.clientX);
    });

    window.addEventListener("mouseup", () => {
        isColorDragging = false;
    });

    // Touch support for color bar
    colorBar.addEventListener("touchstart", (e) => {
        isColorDragging = true;
        if (e.touches.length > 0) {
            handleColorPick(e.touches[0].clientX);
        }
    });

    window.addEventListener("touchmove", (e) => {
        if (!isColorDragging) return;
        if (e.touches.length > 0) {
            handleColorPick(e.touches[0].clientX);
        }
    });

    window.addEventListener("touchend", () => {
        isColorDragging = false;
    });

    // Bedroom Brightness slider
    if (bedBrightnessSlider) {
        bedBrightnessSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            bedBrightnessLabel.textContent = `${val}%`;
            
            const isLightsOn = toggleBedroomLights ? toggleBedroomLights.checked : true;
            if (isLightsOn && bedroomLightsWidget) {
                const opacity = val / 100;
                let currentColor = 'rgb(255, 204, 0)'; // default yellow
                if (colorIndicator && colorIndicator.style.backgroundColor) {
                    currentColor = colorIndicator.style.backgroundColor;
                }
                
                bedroomLightsWidget.style.borderColor = currentColor;
                
                // Adjust shadow based on brightness
                let shadowColor;
                if (currentColor.startsWith('hsl')) {
                    // Extract hue
                    const hslMatch = currentColor.match(/\d+(\.\d+)?/g);
                    if (hslMatch && hslMatch.length >= 3) {
                        shadowColor = `hsla(${hslMatch[0]}, ${hslMatch[1]}%, ${hslMatch[2]}%, ${Math.max(0.2, opacity)})`;
                    }
                } else if (currentColor.startsWith('rgb')) {
                    shadowColor = currentColor.replace('rgb', 'rgba').replace(')', `, ${Math.max(0.2, opacity)})`);
                }
                
                if (shadowColor) {
                    const glowSize = 10 + (opacity * 30); // 10px to 40px
                    bedroomLightsWidget.style.boxShadow = `0 0 ${glowSize}px ${shadowColor}`;
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // 10.5. Nursery Lighting Control
    // -------------------------------------------------------------------------
    
    // Ceiling Light
    const toggleNurseryLight1 = document.getElementById("toggle-nursery-light1");
    const sliderNurseryLight1 = document.getElementById("slider-nursery-light1");
    const labelNurseryLight1 = document.getElementById("val-nursery-light1");
    const widgetNurseryLight1 = document.getElementById("widget-nursery-lights");
    
    function updateNurseryLight1() {
        if (!sliderNurseryLight1 || !labelNurseryLight1 || !widgetNurseryLight1) return;
        const val = sliderNurseryLight1.value;
        labelNurseryLight1.textContent = `${val}%`;
        
        const isOn = toggleNurseryLight1 ? toggleNurseryLight1.checked : true;
        if (!isOn) {
            widgetNurseryLight1.style.boxShadow = "none";
            widgetNurseryLight1.style.borderColor = "rgba(255, 255, 255, 0.1)";
        } else {
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Warm white (hsl(45, 100%, 70%))
            widgetNurseryLight1.style.borderColor = `hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
            widgetNurseryLight1.style.boxShadow = `0 0 ${glowSize}px hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
        }
    }
    
    if (toggleNurseryLight1) toggleNurseryLight1.addEventListener("change", updateNurseryLight1);
    if (sliderNurseryLight1) sliderNurseryLight1.addEventListener("input", updateNurseryLight1);

    // Nightlight
    const toggleNurseryLight2 = document.getElementById("toggle-nursery-light2");
    const sliderNurseryLight2 = document.getElementById("slider-nursery-light2");
    const labelNurseryLight2 = document.getElementById("val-nursery-light2");
    const widgetNurseryLight2 = document.getElementById("widget-nursery-nightlight");
    
    function updateNurseryLight2() {
        if (!sliderNurseryLight2 || !labelNurseryLight2 || !widgetNurseryLight2) return;
        const val = sliderNurseryLight2.value;
        labelNurseryLight2.textContent = `${val}%`;
        
        const isOn = toggleNurseryLight2 ? toggleNurseryLight2.checked : true;
        if (!isOn) {
            widgetNurseryLight2.style.boxShadow = "none";
            widgetNurseryLight2.style.borderColor = "rgba(255, 255, 255, 0.1)";
        } else {
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Soft Amber (hsl(30, 100%, 50%))
            widgetNurseryLight2.style.borderColor = `hsla(30, 100%, 50%, ${Math.max(0.2, opacity)})`;
            widgetNurseryLight2.style.boxShadow = `0 0 ${glowSize}px hsla(30, 100%, 50%, ${Math.max(0.2, opacity)})`;
        }
    }

    if (toggleNurseryLight2) toggleNurseryLight2.addEventListener("change", updateNurseryLight2);
    if (sliderNurseryLight2) sliderNurseryLight2.addEventListener("input", updateNurseryLight2);
    
    // Initialize Nursery Lights on load
    updateNurseryLight1();
    updateNurseryLight2();

    // -------------------------------------------------------------------------
    // Living Room New Widgets Logic
    // -------------------------------------------------------------------------
    
    // Living Room Lamp Brightness slider
    const livingLampSlider = document.getElementById("slider-living-lamp");
    if (livingLampSlider) {
        const livingLampLabel = document.getElementById("label-living-lamp");
        const livingLampIcon = document.getElementById("living-lamp-icon");
        livingLampSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            livingLampLabel.textContent = `${val}%`;
            const isLampActive = document.querySelector("#widget-living-lamp input").checked;
            if (isLampActive) {
                const glowOpacity = val / 100;
                const glowSize = 20 + (val / 100 * 40); // 20px to 60px
                livingLampIcon.style.textShadow = `0 0 ${glowSize}px rgba(255,183,0,${glowOpacity})`;
                livingLampIcon.style.opacity = Math.max(0.2, glowOpacity);
            }
        });
    }

    // Living Room Volume slider
    const livingVolumeSlider = document.getElementById("slider-living-volume");
    if (livingVolumeSlider) {
        const livingVolumeLabel = document.getElementById("label-living-volume");
        livingVolumeSlider.addEventListener("input", (e) => {
            livingVolumeLabel.textContent = `${e.target.value}%`;
        });
    }

    // Living Room TV modes
    const tvModes = document.querySelectorAll("#widget-living-tv .mode-btn");
    const tvDisplay = document.querySelector("#widget-living-tv .tv-channel-display");
    if (tvModes && tvDisplay) {
        tvModes.forEach(btn => {
            btn.addEventListener("click", () => {
                tvModes.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                if (btn.dataset.mode === "netflix") tvDisplay.textContent = "Netflix";
                else if (btn.dataset.mode === "youtube") tvDisplay.textContent = "YouTube";
                else if (btn.dataset.mode === "hdmi1") tvDisplay.textContent = "HDMI 1";
            });
        });
    }

    // -------------------------------------------------------------------------
    // 11. Bedroom Media & TV volume selector
    // -------------------------------------------------------------------------
    let audioPlaying = false;
    const audioPlayBtn = document.getElementById("btn-audio-play");
    const audioStatus = document.getElementById("status-bedroom-audio");

    audioPlayBtn.addEventListener("click", () => {
        const isSpeakerOn = document.querySelector("#widget-bedroom-speaker input").checked;
        if (!isSpeakerOn) return;

        audioPlaying = !audioPlaying;
        if (audioPlaying) {
            // Set pause SVG icon
            audioPlayBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            `;
            audioStatus.textContent = "Amazon Echo • Playing: Lofi Beats";
        } else {
            // Set play SVG icon
            audioPlayBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            audioStatus.textContent = "Amazon Echo • Paused";
        }
    });

    // TV Channels
    let currentChannel = 4;
    const channelLabel = document.getElementById("val-tv-channel");
    document.getElementById("btn-tv-channel-up").addEventListener("click", () => {
        currentChannel = (currentChannel % 10) + 1;
        channelLabel.textContent = `CH ${String(currentChannel).padStart(2, "0")}`;
    });
    document.getElementById("btn-tv-channel-down").addEventListener("click", () => {
        currentChannel = currentChannel - 1 || 10;
        channelLabel.textContent = `CH ${String(currentChannel).padStart(2, "0")}`;
    });

    // -------------------------------------------------------------------------
    // 12. Nursery Sound Machine
    // -------------------------------------------------------------------------
    let soundPlaying = false;
    const nurseryPlayBtn = document.getElementById("btn-nursery-play");
    const nurserySoundBtns = [
        document.getElementById("btn-sound-white"),
        document.getElementById("btn-sound-lullaby"),
        document.getElementById("btn-sound-rain")
    ];

    nurseryPlayBtn.addEventListener("click", () => {
        const isSoundOn = document.querySelector("#widget-nursery-sound input").checked;
        if (!isSoundOn) return;

        soundPlaying = !soundPlaying;
        if (soundPlaying) {
            nurseryPlayBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            `;
        } else {
            nurseryPlayBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        }
    });

    nurserySoundBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            nurserySoundBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Nursery Dimmer labels
    const dim1 = document.getElementById("slider-nursery-light1");
    const valDim1 = document.getElementById("val-nursery-light1");
    dim1.addEventListener("input", (e) => {
        valDim1.textContent = `${e.target.value}%`;
        updateSummaryBanner();
    });

    const dim2 = document.getElementById("slider-nursery-light2");
    const valDim2 = document.getElementById("val-nursery-light2");
    dim2.addEventListener("input", (e) => {
        valDim2.textContent = `${e.target.value}%`;
        updateSummaryBanner();
    });

    // Nursery humidity slider
    const humSlider = document.getElementById("slider-nursery-humidity");
    const humLabel = document.getElementById("label-nursery-humidity");
    humSlider.addEventListener("input", (e) => {
        humLabel.textContent = `${e.target.value}%`;
    });

    // Laundry Fan
    const laundryFanSlider = document.getElementById("slider-laundry-fan");
    if (laundryFanSlider) {
        const laundryFanLabel = document.getElementById("label-laundry-fan");
        const fanModes = ["Off", "Low", "Medium", "High"];
        laundryFanSlider.addEventListener("input", (e) => {
            laundryFanLabel.textContent = fanModes[e.target.value];
        });
    }

    // -------------------------------------------------------------------------
    // 13. Simulated Sensors Oscillation (Aesthetic Polish)
    // -------------------------------------------------------------------------
    setInterval(() => {
        // A. Fluctuating noise in Nursery
        const noiseElement = document.getElementById("val-nursery-noise");
        if (noiseElement) {
            const baseNoise = 12;
            const diff = (Math.random() * 4 - 2); // -2 to +2
            const isAsleep = document.getElementById("widget-nursery-sound").classList.contains("active");
            const modifier = isAsleep ? 3 : 0; // sound machine adds minor decibels
            noiseElement.textContent = `${Math.round(baseNoise + diff + modifier)} dB`;
        }

        // B. Fluctuating speed for living router
        const routerText = document.getElementById("status-living-router-text");
        if (routerText && document.getElementById("widget-living-router").classList.contains("active")) {
            const baseEnergy = 212;
            const deviation = (Math.random() * 8 - 4).toFixed(1);
            routerText.textContent = `${(baseEnergy + parseFloat(deviation)).toFixed(1)} kWh • Connected`;
        }
    }, 4000);

    // -------------------------------------------------------------------------
    // 14. Emergency Call 911 / Fire Alarm Simulation
    // -------------------------------------------------------------------------
    const emergencyCallBtn = document.getElementById("btn-emergency-call");
    const kitchenFireAlarmBtn = document.getElementById("btn-kitchen-fire-alarm");
    const cancelCallBtn = document.getElementById("btn-cancel-emergency-call");
    const callOverlay = document.getElementById("emergency-call-overlay");
    const callStatusText = document.getElementById("emergency-call-status");
    const callTitle = document.getElementById("emergency-call-title");
    const callIcon = document.getElementById("emergency-call-icon");

    let callTimer = null;
    let callCountdown = 5;

    function startEmergencySequence(type) {
        // Show overlay with transition
        callOverlay.style.display = "flex";
        setTimeout(() => {
            callOverlay.classList.add("active");
        }, 10);

        callCountdown = 5;
        
        if (type === "911") {
            if (callTitle) callTitle.textContent = "Calling 911";
            if (callIcon) callIcon.textContent = "📞";
            callStatusText.textContent = `Connecting in ${callCountdown}s... Press Cancel to abort.`;
        } else if (type === "fire") {
            if (callTitle) callTitle.textContent = "Calling Fire Dept";
            if (callIcon) callIcon.textContent = "🚒";
            callStatusText.textContent = `Connecting in ${callCountdown}s... Press Cancel to abort.`;
        }

        cancelCallBtn.textContent = "Cancel Emergency Call";
        cancelCallBtn.style.background = "#dc2626";

        callTimer = setInterval(() => {
            callCountdown--;
            if (callCountdown > 0) {
                callStatusText.textContent = `Connecting in ${callCountdown}s... Press Cancel to abort.`;
            } else {
                clearInterval(callTimer);
                callTimer = null;
                if (type === "911") {
                    callStatusText.innerHTML = `<span style="color: #00e272; font-weight: bold;">CONNECTED TO DISPATCH</span><br><br>Help is on the way to 1042 Aura Way. Stay on the line.`;
                } else if (type === "fire") {
                    callStatusText.innerHTML = `<span style="color: #00e272; font-weight: bold;">FIRE DEPT DISPATCHED</span><br><br>Engines are en route to 1042 Aura Way. Evacuate immediately.`;
                }
                cancelCallBtn.textContent = "Hang Up";
                cancelCallBtn.style.background = "#4b5563"; // gray hang up
            }
        }, 1000);
    }

    if (cancelCallBtn && callOverlay && callStatusText) {
        if (emergencyCallBtn) {
            emergencyCallBtn.addEventListener("click", () => startEmergencySequence("911"));
        }
        
        if (kitchenFireAlarmBtn) {
            kitchenFireAlarmBtn.addEventListener("click", () => startEmergencySequence("fire"));
        }

        cancelCallBtn.addEventListener("click", () => {
            if (callTimer) {
                clearInterval(callTimer);
                callTimer = null;
            }
            // Hide overlay with transition
            callOverlay.classList.remove("active");
            setTimeout(() => {
                callOverlay.style.display = "none";
            }, 400); // match transition
        });
    }

    // -------------------------------------------------------------------------
    // 15. Emergency Sirens & Alarm Toggle (Web Audio Synth)
    // -------------------------------------------------------------------------
    const emergencyAlarmBtn = document.getElementById("btn-emergency-alarm");
    const alarmFlashVignette = document.getElementById("emergency-alarm-flash");
    const alarmLabel = document.getElementById("lbl-emergency-alarm");
    const alarmDesc = document.getElementById("lbl-alarm-desc");
    let alarmActive = false;

    let audioCtx = null;
    let sirenOsc = null;
    let sirenLFO = null;
    let sirenGain = null;

    function startSiren() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            sirenOsc = audioCtx.createOscillator();
            sirenLFO = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            sirenGain = audioCtx.createGain();

            sirenOsc.type = "sawtooth"; // piercing, realistic alarm sound
            sirenOsc.frequency.value = 600; // base frequency

            sirenLFO.type = "sine";
            sirenLFO.frequency.value = 1.5; // sweep speed (1.5 Hz)
            lfoGain.gain.value = 150; // sweep range (+/- 150Hz)

            sirenGain.gain.setValueAtTime(0, audioCtx.currentTime);
            sirenGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1); // fade in to 20% vol

            sirenLFO.connect(lfoGain);
            lfoGain.connect(sirenOsc.frequency);
            sirenOsc.connect(sirenGain);
            sirenGain.connect(audioCtx.destination);

            sirenOsc.start();
            sirenLFO.start();
        } catch (err) {
            console.error("Audio Context failed: ", err);
        }
    }

    function stopSiren() {
        if (sirenGain && audioCtx) {
            try {
                sirenGain.gain.setValueAtTime(sirenGain.gain.value, audioCtx.currentTime);
                sirenGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                setTimeout(() => {
                    if (sirenOsc) { sirenOsc.stop(); sirenOsc.disconnect(); sirenOsc = null; }
                    if (sirenLFO) { sirenLFO.stop(); sirenLFO.disconnect(); sirenLFO = null; }
                    if (sirenGain) { sirenGain.disconnect(); sirenGain = null; }
                }, 150);
            } catch (err) {
                console.error("Failed to stop siren audio: ", err);
            }
        }
    }

    if (emergencyAlarmBtn && alarmFlashVignette && alarmLabel && alarmDesc) {
        emergencyAlarmBtn.addEventListener("click", () => {
            alarmActive = !alarmActive;

            if (alarmActive) {
                // Activate Flashing Vignette
                alarmFlashVignette.style.display = "block";
                setTimeout(() => {
                    alarmFlashVignette.classList.add("active");
                }, 10);

                // Update Button styling to show it's active
                emergencyAlarmBtn.style.background = "rgba(220, 38, 38, 0.4)";
                emergencyAlarmBtn.style.borderColor = "#dc2626";
                emergencyAlarmBtn.style.boxShadow = "0 0 25px rgba(220, 38, 38, 0.6)";

                alarmLabel.textContent = "ALARM ACTIVE (STOP)";
                alarmDesc.textContent = "House sirens are sounding. Click to silence.";

                // Play Siren
                startSiren();
            } else {
                // Deactivate Flashing Vignette
                alarmFlashVignette.classList.remove("active");
                setTimeout(() => {
                    alarmFlashVignette.style.display = "none";
                }, 500);

                // Restore Button styling
                emergencyAlarmBtn.style.background = "rgba(245, 158, 11, 0.15)";
                emergencyAlarmBtn.style.borderColor = "rgba(245, 158, 11, 0.4)";
                emergencyAlarmBtn.style.boxShadow = "none";

                alarmLabel.textContent = "TRIGGER ALARM";
                alarmDesc.textContent = "Sound sirens & flash lights";

                // Stop Siren
                stopSiren();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 16. Emergency Main Gate Controller
    // -------------------------------------------------------------------------
    const emergencyGateBtn = document.getElementById("btn-emergency-gate");
    const gateLabel = document.getElementById("lbl-emergency-gate");
    const gateDesc = document.getElementById("lbl-gate-desc");
    const gateIconBg = document.getElementById("icon-emergency-gate-bg");
    let gateState = "CLOSED"; // CLOSED, OPENING, OPEN, CLOSING
    let gateTimeout = null;

    if (emergencyGateBtn && gateLabel && gateDesc && gateIconBg) {
        emergencyGateBtn.addEventListener("click", () => {
            // Prevent double-clicks during transitions
            if (gateState === "OPENING" || gateState === "CLOSING") return;

            if (gateState === "CLOSED") {
                gateState = "OPENING";
                gateLabel.textContent = "MAIN GATE: OPENING...";
                gateDesc.textContent = "Opening gate, please wait...";
                gateIconBg.style.background = "rgba(245, 158, 11, 0.4)";
                gateIconBg.style.color = "var(--accent-orange)";
                emergencyGateBtn.style.borderColor = "rgba(245, 158, 11, 0.4)";
                emergencyGateBtn.style.background = "rgba(245, 158, 11, 0.05)";

                gateTimeout = setTimeout(() => {
                    gateState = "OPEN";
                    gateLabel.textContent = "MAIN GATE: OPEN";
                    gateDesc.textContent = "Click to Close Gate";
                    gateIconBg.style.background = "rgba(0, 226, 114, 0.4)";
                    gateIconBg.style.color = "var(--accent-green)";
                    emergencyGateBtn.style.borderColor = "rgba(0, 226, 114, 0.4)";
                    emergencyGateBtn.style.background = "rgba(0, 226, 114, 0.05)";
                }, 3000);
            } else if (gateState === "OPEN") {
                gateState = "CLOSING";
                gateLabel.textContent = "MAIN GATE: CLOSING...";
                gateDesc.textContent = "Closing gate, please wait...";
                gateIconBg.style.background = "rgba(245, 158, 11, 0.4)";
                gateIconBg.style.color = "var(--accent-orange)";
                emergencyGateBtn.style.borderColor = "rgba(245, 158, 11, 0.4)";
                emergencyGateBtn.style.background = "rgba(245, 158, 11, 0.05)";

                gateTimeout = setTimeout(() => {
                    gateState = "CLOSED";
                    gateLabel.textContent = "MAIN GATE: CLOSED";
                    gateDesc.textContent = "Click to Open Gate";
                    gateIconBg.style.background = "rgba(255, 255, 255, 0.1)";
                    gateIconBg.style.color = "white";
                    emergencyGateBtn.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    emergencyGateBtn.style.background = "rgba(255, 255, 255, 0.05)";
                }, 3000);
            }
        });
    }

    // Initial sync
    updateSummaryBanner();
});
