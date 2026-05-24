// Aura Smart Home Dashboard - Interactive Scripting

// ─────────────────────────────────────────────────────────────────────────────
// CCTV Lightbox — global scope so inline onclick attributes can call them
// ─────────────────────────────────────────────────────────────────────────────
function openCctvModal(src, title) {
    const overlay = document.getElementById('cctv-modal-overlay');
    const img = document.getElementById('cctv-modal-img');
    const lbl = document.getElementById('cctv-modal-title');
    if (!overlay || !img) return;
    img.src = src;
    if (lbl) lbl.textContent = title || 'Camera';
    overlay.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    }));
    document.body.style.overflow = 'hidden';
}

function closeCctvModal() {
    const overlay = document.getElementById('cctv-modal-overlay');
    const img = document.getElementById('cctv-modal-img');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        if (img) img.src = '';
        document.body.style.overflow = '';
    }, 300);
}

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
                    changeRoom("living-room");
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
            const lampSlider = document.getElementById("slider-living-lamp");
            if (lampSlider) {
                lampSlider.dispatchEvent(new Event("input"));
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

            const speakerGraphic = document.getElementById("speaker-graphic-container");
            const speakerSlider = document.getElementById("speaker-slider-container");
            if (speakerGraphic) {
                speakerGraphic.style.opacity = isChecked ? "1" : "0.5";
                speakerGraphic.style.filter = isChecked ? "none" : "grayscale(100%)";
            }
            if (speakerSlider) {
                speakerSlider.style.opacity = isChecked ? "1" : "0.3";
            }
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
        else if (id === "widget-kitchen-lamp") {
            updateKitchenLight();
        }
        else if (id === "widget-kitchen-dishwasher") {
            document.getElementById("status-dishwasher-text").textContent = isChecked ? "Heavy Cycle • 35 mins left" : "Off";
            const icon = document.getElementById("dishwasher-icon");
            if (icon) {
                icon.style.opacity = isChecked ? "1" : "0.3";
            }
        }
        else if (id === "widget-kitchen-ventilation") {
            const statusText = document.getElementById("status-ventilation-text");
            if (statusText) statusText.textContent = isChecked ? "Active • Speed 2" : "Off";
            const icon = document.getElementById("ventilation-icon");
            if (icon) {
                if (isChecked) {
                    icon.style.animation = "spin 4s linear infinite";
                    icon.style.opacity = "1";
                } else {
                    icon.style.animation = "none";
                    icon.style.opacity = "0.3";
                }
            }
        }
        else if (id === "widget-kitchen-door") {
            const doorStatus = document.getElementById("status-kitchen-door-text");
            if (doorStatus) doorStatus.textContent = isChecked ? "Locked" : "Unlocked";
        }
        else if (id === "widget-kitchen-oven") {
            const statusText = document.getElementById("status-kitchen-oven-text");
            const ovenGlow = document.getElementById("oven-glow-window");
            const dialInfo = document.getElementById("status-kitchen-oven");
            if (isChecked) {
                statusText.textContent = `Preheating • ${document.getElementById("val-kitchen-oven").textContent}`;
                if (ovenGlow) ovenGlow.style.opacity = "1";
                if (dialInfo) dialInfo.textContent = "Preheating";
            } else {
                statusText.textContent = "Off";
                if (ovenGlow) ovenGlow.style.opacity = "0.2";
                if (dialInfo) dialInfo.textContent = "Off";
            }
            if (typeof updateOvenTimerDisplay === 'function') {
                updateOvenTimerDisplay();
            }
        }

        // Bedroom updates
        else if (id === "widget-bedroom-ac") {
            const statusText = document.getElementById("status-bedroom-ac");
            const acLed = document.getElementById("ac-led-bedroom");
            const acImg = document.getElementById("bedroom-ac-img");
            const valText = document.getElementById("val-bedroom-ac");
            const progress = document.getElementById("progress-bedroom-ac");
            const btnDown = document.getElementById("btn-bedroom-ac-down");
            const btnUp = document.getElementById("btn-bedroom-ac-up");

            if (isChecked) {
                // Restore active values and colors
                updateBedroomAc(bedroomAcVal);
            } else {
                statusText.textContent = "Off";
                if (valText) valText.textContent = "--";
                if (acLed) {
                    acLed.textContent = "--";
                    acLed.style.color = "rgba(255, 255, 255, 0.3)";
                    acLed.style.textShadow = "none";
                }
                if (acImg) {
                    acImg.style.background = "rgba(255, 255, 255, 0.12)";
                    acImg.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    const flap = acImg.querySelector("div");
                    const vents = acImg.querySelectorAll("div")[1];
                    if (flap) flap.style.opacity = "0.3";
                    if (vents) vents.style.opacity = "0.3";
                }
                if (progress) {
                    progress.style.stroke = "rgba(255, 255, 255, 0.15)";
                }
                if (btnDown) {
                    btnDown.style.opacity = "0.4";
                    btnDown.style.pointerEvents = "none";
                }
                if (btnUp) {
                    btnUp.style.opacity = "0.4";
                    btnUp.style.pointerEvents = "none";
                }
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
            const volSlider = document.getElementById("slider-bedroom-volume");
            const volContainer = volSlider ? volSlider.parentElement : null;
            if (volContainer) {
                volContainer.style.opacity = isChecked ? "1" : "0.4";
                volContainer.style.pointerEvents = isChecked ? "auto" : "none";
            }
        }
        else if (id === "widget-bedroom-tv") {
            const tvChannel = document.getElementById("val-tv-channel");
            document.getElementById("status-bedroom-tv-text").textContent = isChecked ? `Netflix • ${tvChannel ? tvChannel.textContent : "CH 04"}` : "Inactive";
            const tvScreen = document.querySelector("#tv-screen-bedroom .tv-glow-indicator");
            if (tvScreen) tvScreen.style.opacity = isChecked ? "0" : "1";
        }
        else if (id === "widget-bedroom-vacuum") {
            const statusText = document.getElementById("status-bedroom-vacuum-text");
            if (statusText) statusText.textContent = isChecked ? "Cleaning" : "Docked • 100%";
            const vacuumLed = document.getElementById("vacuum-led");
            if (vacuumLed) {
                vacuumLed.style.background = isChecked ? "var(--accent-green)" : "rgba(255, 255, 255, 0.2)";
                vacuumLed.style.boxShadow = isChecked ? "0 0 5px var(--accent-green)" : "none";
            }
            const chassis = document.getElementById("vacuum-chassis");
            if (chassis) {
                if (isChecked) {
                    chassis.style.animation = "spin 4s linear infinite";
                } else {
                    chassis.style.animation = "none";
                }
            }
        }
        else if (id === "widget-bedroom-door") {
            const doorStatus = document.getElementById("status-bedroom-door-text");
            if (doorStatus) doorStatus.textContent = isChecked ? "Locked" : "Unlocked";
            const doorIcon = document.getElementById("bedroom-door-icon");
            if (doorIcon) {
                doorIcon.style.opacity = isChecked ? "1" : "0.5";
            }
        }

        // Nursery updates
        else if (id === "widget-nursery-ac") {
            const statusText = document.getElementById("status-nursery-ac-text");
            const valText = document.getElementById("val-nursery-ac");
            const statusDial = document.getElementById("status-nursery-ac");
            const progress = document.getElementById("progress-nursery-ac");
            const btnDown = document.getElementById("btn-nursery-ac-down");
            const btnUp = document.getElementById("btn-nursery-ac-up");

            if (isChecked) {
                if (btnDown) {
                    btnDown.style.opacity = "1";
                    btnDown.style.pointerEvents = "";
                }
                if (btnUp) {
                    btnUp.style.opacity = "1";
                    btnUp.style.pointerEvents = "";
                }
                updateNurseryAc(nurseryAcVal);
            } else {
                if (statusText) statusText.textContent = "Off";
                if (valText) valText.textContent = "--";
                if (statusDial) statusDial.textContent = "Off";
                if (progress) progress.style.stroke = "rgba(255, 255, 255, 0.15)";
                if (btnDown) {
                    btnDown.style.opacity = "0.4";
                    btnDown.style.pointerEvents = "none";
                }
                if (btnUp) {
                    btnUp.style.opacity = "0.4";
                    btnUp.style.pointerEvents = "none";
                }
            }
        }
        else if (id === "widget-nursery-purifier") {
            const statusText = document.getElementById("status-nursery-purifier-text");
            const valAqi = document.getElementById("val-purifier-aqi");
            const gaugeProgress = document.getElementById("purifier-gauge-progress");
            const valStatus = document.getElementById("val-purifier-status");

            if (isChecked) {
                if (statusText) statusText.textContent = "Active • Excellent";
                if (valAqi) valAqi.textContent = "12 AQI";
                if (gaugeProgress) {
                    gaugeProgress.style.borderColor = "var(--accent-green)";
                    gaugeProgress.style.borderBottomColor = "transparent";
                    gaugeProgress.style.borderRightColor = "transparent";
                }
                if (valStatus) valStatus.textContent = "Good";
            } else {
                if (statusText) statusText.textContent = "Off";
                if (valAqi) valAqi.textContent = "--";
                if (gaugeProgress) {
                    gaugeProgress.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    gaugeProgress.style.borderBottomColor = "transparent";
                    gaugeProgress.style.borderRightColor = "transparent";
                }
                if (valStatus) valStatus.textContent = "Inactive";
            }
        }

        // Laundry updates
        else if (id === "widget-laundry-washer") {
            const statusMode = document.getElementById("status-washer-mode");
            const valTime = document.getElementById("val-washer-time");
            const deviceImg = document.getElementById("img-laundry-washer");
            const led = document.getElementById("washer-led");
            const panelText = document.getElementById("washer-panel-text");
            const doorRing = document.getElementById("washer-door-ring");
            const chassis = document.getElementById("washer-chassis");

            if (statusMode) statusMode.textContent = isChecked ? "Washing" : "Off";
            if (valTime) valTime.textContent = isChecked ? "45m" : "--";

            if (deviceImg) {
                deviceImg.style.opacity = isChecked ? "1" : "0.2";
                deviceImg.style.animationPlayState = isChecked ? "running" : "paused";
            }
            if (led) {
                led.style.background = isChecked ? "var(--accent-blue)" : "rgba(255, 255, 255, 0.2)";
                led.style.boxShadow = isChecked ? "0 0 5px var(--accent-blue)" : "none";
            }
            if (panelText) {
                panelText.textContent = isChecked ? "45 MIN" : "OFF";
                panelText.style.color = isChecked ? "var(--accent-blue)" : "rgba(255, 255, 255, 0.3)";
            }
            if (doorRing) {
                doorRing.style.borderColor = isChecked ? "var(--accent-blue)" : "rgba(255, 255, 255, 0.2)";
                doorRing.style.boxShadow = isChecked ? "0 0 12px rgba(0, 168, 255, 0.4)" : "none";
            }
            if (chassis) {
                chassis.style.borderColor = isChecked ? "#2d3748" : "rgba(255, 255, 255, 0.1)";
                chassis.style.boxShadow = isChecked ? "0 10px 20px rgba(0,0,0,0.5)" : "none";
            }
        }
        else if (id === "widget-laundry-dryer") {
            const statusMode = document.getElementById("status-dryer-mode");
            const valTime = document.getElementById("val-dryer-time");
            const deviceImg = document.getElementById("img-laundry-dryer");
            const led = document.getElementById("dryer-led");
            const panelText = document.getElementById("dryer-panel-text");
            const doorRing = document.getElementById("dryer-door-ring");
            const chassis = document.getElementById("dryer-chassis");

            if (statusMode) statusMode.textContent = isChecked ? "Drying" : "Off";
            if (valTime) valTime.textContent = isChecked ? "1h 20m" : "--";

            if (deviceImg) {
                deviceImg.style.opacity = isChecked ? "1" : "0.2";
                deviceImg.style.animationPlayState = isChecked ? "running" : "paused";
            }
            if (led) {
                led.style.background = isChecked ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.2)";
                led.style.boxShadow = isChecked ? "0 0 5px var(--accent-orange)" : "none";
            }
            if (panelText) {
                panelText.textContent = isChecked ? "1H 20M" : "OFF";
                panelText.style.color = isChecked ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.3)";
            }
            if (doorRing) {
                doorRing.style.borderColor = isChecked ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.2)";
                doorRing.style.boxShadow = isChecked ? "0 0 12px rgba(245, 158, 11, 0.4)" : "none";
            }
            if (chassis) {
                chassis.style.borderColor = isChecked ? "#2d3748" : "rgba(255, 255, 255, 0.1)";
                chassis.style.boxShadow = isChecked ? "0 10px 20px rgba(0,0,0,0.5)" : "none";
            }
        }
        else if (id === "widget-laundry-light") {
            updateLaundryLight();
        }
        else if (id === "widget-laundry-fan") {
            updateLaundryFanState();
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
        if (document.getElementById("widget-kitchen-lamp") && document.getElementById("widget-kitchen-lamp").classList.contains("active")) activeLights += 1;

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
        if (document.getElementById("widget-nursery-ac") && document.getElementById("widget-nursery-ac").classList.contains("active")) {
            const valEl = document.getElementById("val-nursery-ac");
            const valStr = valEl ? valEl.textContent : "";
            if (valStr && valStr !== "--") {
                climateActive = true;
                temps.push(parseFloat(valStr));
            }
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
    function setDialProgress(progressCircle, valText, statusText, val, min, max, unit, statusMsg, isOven = false) {
        // Map value to angle / stroke-dashoffset
        const r = parseFloat(progressCircle.getAttribute("r")) || 60;
        const circ = 2 * Math.PI * r;
        const ratio = (val - min) / (max - min);
        const offset = circ - (ratio * circ);

        progressCircle.style.strokeDasharray = circ;
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
        const toggle = document.querySelector('#widget-bedroom-ac .toggle-control');
        if (toggle && !toggle.checked) return;

        bedroomAcVal = Math.max(16.0, Math.min(30.0, val));
        let status = "Cooling";
        if (bedroomAcVal > 24.0) status = "Heating";
        else if (bedroomAcVal > 22.0) status = "Auto";

        setDialProgress(progressBedroomAc, valBedroomAc, statusBedroomAc, bedroomAcVal, 16.0, 30.0, "°", status);

        const acLed = document.getElementById("ac-led-bedroom");
        if (acLed) {
            acLed.textContent = `${Math.round(bedroomAcVal)}°`;
            acLed.style.color = "#00d4ff";
            acLed.style.textShadow = "0 0 5px #00d4ff";
        }

        const acImg = document.getElementById("bedroom-ac-img");
        if (acImg) {
            acImg.style.background = "#fff";
            acImg.style.borderColor = "#ddd";
            const flap = acImg.querySelector("div");
            const vents = acImg.querySelectorAll("div")[1];
            if (flap) flap.style.opacity = "1";
            if (vents) vents.style.opacity = "1";
        }

        const progress = document.getElementById("progress-bedroom-ac");
        if (progress) {
            progress.style.stroke = ""; // Clear inline stroke to fall back to CSS theme (accent blue)
        }

        const btnDown = document.getElementById("btn-bedroom-ac-down");
        const btnUp = document.getElementById("btn-bedroom-ac-up");
        if (btnDown) {
            btnDown.style.opacity = "1";
            btnDown.style.pointerEvents = "";
        }
        if (btnUp) {
            btnUp.style.opacity = "1";
            btnUp.style.pointerEvents = "";
        }

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

    // D. Kitchen Oven Timer Logic
    let ovenTimer = 30; // default 30 mins
    const valKitchenOvenTimer = document.getElementById("val-kitchen-oven-timer");

    function updateOvenTimerDisplay() {
        if (!valKitchenOvenTimer) return;
        const toggle = document.querySelector("#widget-kitchen-oven .toggle-control");
        if (toggle && toggle.checked) {
            valKitchenOvenTimer.textContent = `${ovenTimer}m`;
            valKitchenOvenTimer.style.display = "";
        } else {
            valKitchenOvenTimer.textContent = "Off";
            valKitchenOvenTimer.style.display = "none"; // Hide timer when oven is off to keep dial clean
        }
    }

    // Set up click listeners for the timer buttons
    const btnTimerUp = document.getElementById("btn-kitchen-timer-up");
    const btnTimerDown = document.getElementById("btn-kitchen-timer-down");

    if (btnTimerUp) {
        btnTimerUp.addEventListener("click", () => {
            const toggle = document.querySelector("#widget-kitchen-oven .toggle-control");
            if (toggle && !toggle.checked) return; // Only allow when Oven is ON
            ovenTimer = Math.min(120, ovenTimer + 5);
            updateOvenTimerDisplay();
        });
    }

    if (btnTimerDown) {
        btnTimerDown.addEventListener("click", () => {
            const toggle = document.querySelector("#widget-kitchen-oven .toggle-control");
            if (toggle && !toggle.checked) return; // Only allow when Oven is ON
            ovenTimer = Math.max(5, ovenTimer - 5);
            updateOvenTimerDisplay();
        });
    }

    // Countdown logic: decrement the timer every minute (60 seconds) if the oven is active
    setInterval(() => {
        const toggle = document.querySelector("#widget-kitchen-oven .toggle-control");
        if (toggle && toggle.checked && ovenTimer > 0) {
            ovenTimer -= 1;
            updateOvenTimerDisplay();

            // If timer reaches 0, turn off the oven
            if (ovenTimer === 0) {
                toggle.checked = false;
                toggle.dispatchEvent(new Event("change"));
                ovenTimer = 30; // reset for next use
                updateOvenTimerDisplay();
            }
        }
    }, 60000);

    // Initial render call for timer
    updateOvenTimerDisplay();

    // E. Nursery AC (Range: 16.0 to 30.0)
    let nurseryAcVal = 22.0;
    const progressNurseryAc = document.getElementById("progress-nursery-ac");
    const valNurseryAc = document.getElementById("val-nursery-ac");
    const statusNurseryAc = document.getElementById("status-nursery-ac");
    const svgNurseryAc = document.getElementById("svg-nursery-ac");

    function updateNurseryAc(val) {
        const toggle = document.querySelector('#widget-nursery-ac .toggle-control');
        if (toggle && !toggle.checked) return;

        nurseryAcVal = Math.max(16.0, Math.min(30.0, val));
        let status = "Cooling";
        if (nurseryAcVal > 24.0) status = "Heating";
        else if (nurseryAcVal > 22.0) status = "Auto";

        setDialProgress(progressNurseryAc, valNurseryAc, statusNurseryAc, nurseryAcVal, 16.0, 30.0, "°", status);

        const statusText = document.getElementById("status-nursery-ac-text");
        if (statusText) {
            statusText.textContent = `${status} • ${Math.round(nurseryAcVal)}°C`;
        }

        const btnDown = document.getElementById("btn-nursery-ac-down");
        const btnUp = document.getElementById("btn-nursery-ac-up");
        if (btnDown) {
            btnDown.style.opacity = "1";
            btnDown.style.pointerEvents = "";
        }
        if (btnUp) {
            btnUp.style.opacity = "1";
            btnUp.style.pointerEvents = "";
        }

        updateSummaryBanner();
    }
    updateNurseryAc(nurseryAcVal);

    const btnNurseryAcUp = document.getElementById("btn-nursery-ac-up");
    const btnNurseryAcDown = document.getElementById("btn-nursery-ac-down");
    if (btnNurseryAcUp) {
        btnNurseryAcUp.addEventListener("click", () => updateNurseryAc(nurseryAcVal + 0.5));
    }
    if (btnNurseryAcDown) {
        btnNurseryAcDown.addEventListener("click", () => updateNurseryAc(nurseryAcVal - 0.5));
    }

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
    setupDialDrag(svgNurseryAc, updateNurseryAc, 16.0, 30.0);

    // -------------------------------------------------------------------------
    // 8. Kitchen Lamp Control
    // -------------------------------------------------------------------------
    const toggleKitchenLights = document.getElementById("toggle-kitchen-lights");
    const sliderKitchenBrightness = document.getElementById("slider-kitchen-brightness");
    const valKitchenBrightness = document.getElementById("val-kitchen-brightness");
    const widgetKitchenLamp = document.getElementById("widget-kitchen-lamp");

    function updateKitchenLight() {
        if (!sliderKitchenBrightness || !valKitchenBrightness || !widgetKitchenLamp) return;
        const val = sliderKitchenBrightness.value;
        valKitchenBrightness.textContent = `${val}%`;

        // Update iOS fill bar
        const fillBar = document.getElementById("ios-kitchen-brightness-fill");
        if (fillBar) fillBar.style.width = `${val}%`;

        const isOn = toggleKitchenLights ? toggleKitchenLights.checked : true;

        // Toggle slider container interactivity
        const sliderContainer = sliderKitchenBrightness.parentElement;
        if (sliderContainer) {
            sliderContainer.style.opacity = isOn ? "1" : "0.4";
            sliderContainer.style.pointerEvents = isOn ? "auto" : "none";
        }

        // Toggle bulb icon appearance
        const icon = document.getElementById("kitchen-light-icon");
        if (icon) {
            icon.style.opacity = isOn ? "1" : "0.3";
            icon.style.filter = isOn ? `drop-shadow(0 2px ${2 + (val / 10)}px rgba(255, 183, 0, ${0.2 + (val / 125)}))` : "none";
        }

        if (!isOn) {
            widgetKitchenLamp.style.boxShadow = "none";
            widgetKitchenLamp.style.borderColor = "rgba(255, 255, 255, 0.1)";
            widgetKitchenLamp.classList.remove("active");
        } else {
            widgetKitchenLamp.classList.add("active");
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Yellow light (hsl(45, 100%, 70%))
            widgetKitchenLamp.style.borderColor = `hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
            widgetKitchenLamp.style.boxShadow = `0 0 ${glowSize}px hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
        }
        updateSummaryBanner();
    }

    if (toggleKitchenLights) toggleKitchenLights.addEventListener("change", updateKitchenLight);
    if (sliderKitchenBrightness) {
        sliderKitchenBrightness.addEventListener("input", updateKitchenLight);
    }

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
            const brightSlider = document.getElementById("slider-bedroom-brightness");
            const brightContainer = brightSlider ? brightSlider.parentElement : null;
            if (brightContainer) {
                brightContainer.style.opacity = isChecked ? "1" : "0.4";
                brightContainer.style.pointerEvents = isChecked ? "auto" : "none";
            }
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

    if (colorBar) {
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
    }

    // Bedroom Brightness slider
    if (bedBrightnessSlider) {
        bedBrightnessSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            bedBrightnessLabel.textContent = `${val}%`;

            const iosBrightFill = document.getElementById("ios-bedroom-brightness-fill");
            if (iosBrightFill) {
                iosBrightFill.style.width = `${val}%`;
            }

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

        // Update iOS fill bar
        const fillBar = document.getElementById("ios-nursery-light1-fill");
        if (fillBar) fillBar.style.width = `${val}%`;

        const isOn = toggleNurseryLight1 ? toggleNurseryLight1.checked : true;

        // Toggle slider container interactivity
        const sliderContainer = sliderNurseryLight1.parentElement;
        if (sliderContainer) {
            sliderContainer.style.opacity = isOn ? "1" : "0.4";
            sliderContainer.style.pointerEvents = isOn ? "auto" : "none";
        }

        // Toggle bulb icon appearance
        const icon = document.getElementById("nursery-light1-icon");
        if (icon) {
            icon.style.opacity = isOn ? "1" : "0.3";
            icon.style.filter = isOn ? "drop-shadow(0 2px 8px rgba(255, 183, 0, 0.6))" : "none";
        }

        if (!isOn) {
            widgetNurseryLight1.style.boxShadow = "none";
            widgetNurseryLight1.style.borderColor = "rgba(255, 255, 255, 0.1)";
            widgetNurseryLight1.classList.remove("active");
        } else {
            widgetNurseryLight1.classList.add("active");
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Warm white (hsl(45, 100%, 70%))
            widgetNurseryLight1.style.borderColor = `hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
            widgetNurseryLight1.style.boxShadow = `0 0 ${glowSize}px hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
        }
        updateSummaryBanner();
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

        // Update iOS fill bar
        const fillBar = document.getElementById("ios-nursery-light2-fill");
        if (fillBar) fillBar.style.width = `${val}%`;

        const isOn = toggleNurseryLight2 ? toggleNurseryLight2.checked : true;

        // Toggle slider container interactivity
        const sliderContainer = sliderNurseryLight2.parentElement;
        if (sliderContainer) {
            sliderContainer.style.opacity = isOn ? "1" : "0.4";
            sliderContainer.style.pointerEvents = isOn ? "auto" : "none";
        }

        // Toggle moon icon appearance
        const icon = document.getElementById("nursery-light2-icon");
        if (icon) {
            icon.style.opacity = isOn ? "1" : "0.3";
            icon.style.filter = isOn ? "drop-shadow(0 2px 8px rgba(255, 183, 0, 0.6))" : "none";
        }

        if (!isOn) {
            widgetNurseryLight2.style.boxShadow = "none";
            widgetNurseryLight2.style.borderColor = "rgba(255, 255, 255, 0.1)";
            widgetNurseryLight2.classList.remove("active");
        } else {
            widgetNurseryLight2.classList.add("active");
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Soft Amber (hsl(30, 100%, 50%))
            widgetNurseryLight2.style.borderColor = `hsla(30, 100%, 50%, ${Math.max(0.2, opacity)})`;
            widgetNurseryLight2.style.boxShadow = `0 0 ${glowSize}px hsla(30, 100%, 50%, ${Math.max(0.2, opacity)})`;
        }
        updateSummaryBanner();
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
        const iosBrightnessFill = document.getElementById("ios-brightness-fill");
        const lampSliderTrack = document.getElementById("lamp-slider-track");

        livingLampSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            livingLampLabel.textContent = `${val}%`;
            if (iosBrightnessFill) iosBrightnessFill.style.width = `${val}%`;

            const isLampActive = document.querySelector("#widget-living-lamp input").checked;
            if (isLampActive) {
                // Adjust brightness to be significantly more bright once user slides above 40%
                let extraBrightness = 0;
                if (val > 40) {
                    extraBrightness = (val - 40) / 60; // 0.0 to 1.0 multiplier
                }

                const glowOpacity = Math.min(1.0, (val / 100) + (extraBrightness * 0.8)).toFixed(2);
                const glowSize = Math.round(20 + (val / 100 * 40) + (extraBrightness * 60)); // Max 120px

                const r = 255;
                const g = Math.round(183 + (extraBrightness * 72)); // 183 to 255
                const b = Math.round(extraBrightness * 150); // 0 to 150
                const bulbColor = `rgba(${r}, ${g}, ${b}, ${glowOpacity})`;

                livingLampIcon.style.textShadow = `0 0 ${glowSize}px ${bulbColor}, 0 0 ${glowSize / 2}px ${bulbColor}`;
                livingLampIcon.style.opacity = Math.min(1.0, Math.max(0.2, (val / 100) + extraBrightness)).toFixed(2);
                livingLampIcon.style.transform = `scale(1.1)`; // Keep size constant
                livingLampIcon.style.filter = "none";

                const lampSliderContainer = document.getElementById("lamp-slider-container");
                if (lampSliderContainer) {
                    lampSliderContainer.style.opacity = "1";
                    lampSliderContainer.style.filter = "none";
                }

                if (lampSliderTrack) {
                    const trackGlowSize = Math.round(5 + (extraBrightness * 15));
                    lampSliderTrack.style.boxShadow = `inset 0 2px 6px rgba(0,0,0,0.8), 0 0 ${trackGlowSize}px ${bulbColor}`;
                }
            } else {
                if (lampSliderTrack) {
                    lampSliderTrack.style.boxShadow = `inset 0 2px 6px rgba(0,0,0,0.8), 0 0 0px rgba(255,183,0,0)`;
                }
                if (livingLampIcon) {
                    livingLampIcon.style.textShadow = "none";
                    livingLampIcon.style.opacity = "0.2";
                    livingLampIcon.style.filter = "grayscale(100%)";
                }
                const lampSliderContainer = document.getElementById("lamp-slider-container");
                if (lampSliderContainer) {
                    lampSliderContainer.style.opacity = "0.3";
                    lampSliderContainer.style.filter = "grayscale(100%)";
                }
            }
        });
    }

    // Living Room Volume slider
    const livingVolumeSlider = document.getElementById("slider-living-volume");
    if (livingVolumeSlider) {
        const livingVolumeLabel = document.getElementById("label-living-volume");
        const iosVolFill = document.getElementById("ios-volume-fill");
        livingVolumeSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            livingVolumeLabel.textContent = `${val}%`;
            if (iosVolFill) iosVolFill.style.width = `${val}%`;
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

    if (audioPlayBtn) {
        audioPlayBtn.addEventListener("click", () => {
            const speakerToggle = document.querySelector("#widget-bedroom-speaker input");
            const isSpeakerOn = speakerToggle ? speakerToggle.checked : false;
            if (!isSpeakerOn) return;

            audioPlaying = !audioPlaying;
            if (audioPlaying) {
                // Set pause SVG icon
                audioPlayBtn.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                `;
                if (audioStatus) audioStatus.textContent = "Amazon Echo • Playing: Lofi Beats";
            } else {
                // Set play SVG icon
                audioPlayBtn.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
                if (audioStatus) audioStatus.textContent = "Amazon Echo • Paused";
            }
        });
    }

    // Bedroom Speaker Volume Slider
    const bedVolumeSlider = document.getElementById("slider-bedroom-volume");
    if (bedVolumeSlider) {
        const bedVolumeLabel = document.getElementById("label-bedroom-volume");
        const iosVolFill = document.getElementById("ios-bedroom-volume-fill");
        bedVolumeSlider.addEventListener("input", (e) => {
            const val = e.target.value;
            if (bedVolumeLabel) bedVolumeLabel.textContent = `${val}%`;
            if (iosVolFill) iosVolFill.style.width = `${val}%`;
        });
        // Initial setup
        bedVolumeSlider.dispatchEvent(new Event("input"));
    }

    // TV Channels
    let currentChannel = 4;
    const channelLabel = document.getElementById("val-tv-channel");
    const tvChannelUpBtn = document.getElementById("btn-tv-channel-up");
    const tvChannelDownBtn = document.getElementById("btn-tv-channel-down");
    if (tvChannelUpBtn && channelLabel) {
        tvChannelUpBtn.addEventListener("click", () => {
            currentChannel = (currentChannel % 10) + 1;
            channelLabel.textContent = `CH ${String(currentChannel).padStart(2, "0")}`;
        });
    }
    if (tvChannelDownBtn && channelLabel) {
        tvChannelDownBtn.addEventListener("click", () => {
            currentChannel = currentChannel - 1 || 10;
            channelLabel.textContent = `CH ${String(currentChannel).padStart(2, "0")}`;
        });
    }

    // -------------------------------------------------------------------------
    // 12. Nursery Sound Machine (Removed)
    // -------------------------------------------------------------------------

    // Laundry Fan
    const laundryFanSlider = document.getElementById("slider-laundry-fan");
    if (laundryFanSlider) {
        const laundryFanLabel = document.getElementById("label-laundry-fan");
        const fanModes = ["Off", "Low", "Medium", "High"];
        laundryFanSlider.addEventListener("input", (e) => {
            laundryFanLabel.textContent = fanModes[e.target.value];
        });
    }

    // Laundry Smart Fan Control
    const laundryFanBtns = document.querySelectorAll("#laundry-fan-speed-container .segment-btn-ver");
    const laundryFanIcon = document.getElementById("laundry-fan-icon-container");
    const statusLaundryFanText = document.getElementById("status-laundry-fan-text");
    const toggleLaundryFan = document.getElementById("toggle-laundry-fan");

    let currentFanSpeed = "MED"; // Default speed

    function updateLaundryFanState() {
        if (!statusLaundryFanText) return;
        const isOn = toggleLaundryFan ? toggleLaundryFan.checked : true;

        if (!isOn) {
            statusLaundryFanText.textContent = "Off";
            if (laundryFanIcon) {
                laundryFanIcon.style.animation = "none";
                laundryFanIcon.style.opacity = "0.3";
            }
            laundryFanBtns.forEach(btn => {
                btn.style.opacity = "0.4";
                btn.style.pointerEvents = "none";
            });
        } else {
            statusLaundryFanText.textContent = `Active • ${currentFanSpeed}`;
            if (laundryFanIcon) {
                laundryFanIcon.style.opacity = "1";
            }
            laundryFanBtns.forEach(btn => {
                btn.style.opacity = "1";
                btn.style.pointerEvents = "";
                if (btn.dataset.speed === currentFanSpeed) {
                    btn.classList.add("active");
                    btn.style.borderColor = "var(--accent-blue)";
                    btn.style.background = "rgba(0, 168, 255, 0.15)";
                    btn.style.color = "var(--accent-blue)";
                } else {
                    btn.classList.remove("active");
                    btn.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    btn.style.background = "rgba(255, 255, 255, 0.05)";
                    btn.style.color = "#fff";
                }
            });

            if (laundryFanIcon) {
                // Set animation duration based on speed
                let speedDuration = "1.5s";
                if (currentFanSpeed === "HIGH") speedDuration = "0.6s";
                else if (currentFanSpeed === "LOW") speedDuration = "3s";

                laundryFanIcon.style.animation = `spin ${speedDuration} linear infinite`;
            }
        }
    }

    laundryFanBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const isOn = toggleLaundryFan ? toggleLaundryFan.checked : true;
            if (!isOn) return;

            currentFanSpeed = btn.dataset.speed;
            updateLaundryFanState();
        });
    });

    // Run initial update
    updateLaundryFanState();
    // Laundry Overhead Light Control
    const toggleLaundryLight = document.getElementById("toggle-laundry-light");
    const sliderLaundryLight = document.getElementById("slider-laundry-light");
    const labelLaundryLight = document.getElementById("val-laundry-light");
    const widgetLaundryLight = document.getElementById("widget-laundry-light");

    function updateLaundryLight() {
        if (!sliderLaundryLight || !labelLaundryLight || !widgetLaundryLight) return;
        const val = sliderLaundryLight.value;
        labelLaundryLight.textContent = `${val}%`;

        // Update iOS fill bar
        const fillBar = document.getElementById("ios-laundry-light-fill");
        if (fillBar) fillBar.style.width = `${val}%`;

        const isOn = toggleLaundryLight ? toggleLaundryLight.checked : true;

        // Toggle slider container interactivity
        const sliderContainer = sliderLaundryLight.parentElement;
        if (sliderContainer) {
            sliderContainer.style.opacity = isOn ? "1" : "0.4";
            sliderContainer.style.pointerEvents = isOn ? "auto" : "none";
        }

        // Toggle bulb icon appearance
        const icon = document.getElementById("laundry-light-icon");
        if (icon) {
            icon.style.opacity = isOn ? "1" : "0.3";
            icon.style.filter = isOn ? "drop-shadow(0 2px 8px rgba(255, 183, 0, 0.6))" : "none";
        }

        const statusText = document.getElementById("status-laundry-light-text");
        if (statusText) {
            statusText.textContent = isOn ? "Bright White" : "Off";
        }

        if (!isOn) {
            widgetLaundryLight.style.boxShadow = "none";
            widgetLaundryLight.style.borderColor = "rgba(255, 255, 255, 0.1)";
            widgetLaundryLight.classList.remove("active");
        } else {
            widgetLaundryLight.classList.add("active");
            const opacity = val / 100;
            const glowSize = 10 + (opacity * 30); // 10px to 40px
            // Yellow light (hsl(45, 100%, 70%))
            widgetLaundryLight.style.borderColor = `hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
            widgetLaundryLight.style.boxShadow = `0 0 ${glowSize}px hsla(45, 100%, 70%, ${Math.max(0.2, opacity)})`;
        }
    }

    if (toggleLaundryLight) toggleLaundryLight.addEventListener("change", updateLaundryLight);
    if (sliderLaundryLight) sliderLaundryLight.addEventListener("input", updateLaundryLight);

    // Initial sync
    updateLaundryLight();
    updateKitchenLight();

    // -------------------------------------------------------------------------
    // 13. Simulated Sensors Oscillation (Aesthetic Polish)
    // -------------------------------------------------------------------------
    setInterval(() => {
        // A. Fluctuating noise in Nursery
        const noiseElement = document.getElementById("val-nursery-noise");
        if (noiseElement) {
            const baseNoise = 12;
            const diff = (Math.random() * 4 - 2); // -2 to +2
            const widgetNurserySound = document.getElementById("widget-nursery-sound");
            const isAsleep = widgetNurserySound ? widgetNurserySound.classList.contains("active") : false;
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

    // Initial sync for iOS style range sliders
    if (bedBrightnessSlider) {
        bedBrightnessSlider.dispatchEvent(new Event("input"));
    }

    // -------------------------------------------------------------------------
    // 17. CCTV Modal — close-button & backdrop wired up here
    // -------------------------------------------------------------------------
    const cctvCloseBtn = document.getElementById('btn-close-cctv-modal');
    const cctvOverlay = document.getElementById('cctv-modal-overlay');

    if (cctvCloseBtn) cctvCloseBtn.addEventListener('click', closeCctvModal);

    if (cctvOverlay) {
        cctvOverlay.addEventListener('click', (e) => {
            if (e.target === cctvOverlay) closeCctvModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCctvModal();
    });
});
