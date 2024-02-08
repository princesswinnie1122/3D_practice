Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNjY5NmRmOS04OGU2LTQyYTYtYjBkOC04NzMwMTVhNWE3ODAiLCJpZCI6MTk0NDg2LCJpYXQiOjE3MDczMDg2MjZ9.7VlIO8ksrHHXepI5cXcg0bD64hZnd1XjeHKDDIMvj2E';


const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: new Cesium.SingleTileImageryProvider({
        url: '../images/moon.jpg', 
    }),
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: true,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    animation: false,
    skyAtmosphere: false,
});

viewer.scene.globe.showGroundAtmosphere = false;
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(0, 0, 15000000),
    orientation: {
        heading: Cesium.Math.toRadians(0), 
        //pitch: Cesium.Math.toRadians(-30), 
        roll: 0.0
    }
});

// Reset the lookAt transform once done to allow free camera movement again
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);


// Load the KML data source
Cesium.KmlDataSource.load('../data/lognonne.kml', { clampToGround: true })
    .then(function(dataSource) {
        viewer.dataSources.add(dataSource);

        // Example: Iterate through entities and create pulsating points for each
        dataSource.entities.values.forEach(function(entity) {
            if (entity.position) {
                entity.show = false;
                createRippleEffect(entity.position.getValue(Cesium.JulianDate.now()));
            }
        });
    });

    function createRippleEffect(position) {
        // Central point that remains constant
        viewer.entities.add({
            position: position,
            point: {
                color: Cesium.Color.BLUE,
                pixelSize: 10, // Constant size
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
    
        // Create multiple "ripple" points
        const ripplePoints = [];
        for (let i = 0; i < 3; i++) { // 3 ripples for example
            ripplePoints.push(viewer.entities.add({
                position: position,
                point: {
                    color: Cesium.Color.fromCssColorString('#007bff').withAlpha(0.15 - i * 0.05), 
                    pixelSize: 20 + i * 5, // Start with increasing size
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                }
            }));
        }
    
        // Animate the ripples
        viewer.clock.onTick.addEventListener(function() {
            ripplePoints.forEach((point, index) => {
                let pixelSize = point.point.pixelSize.getValue(Cesium.JulianDate.now());
                pixelSize += 1; // Increase size to simulate expansion
                if (pixelSize > 20 + index * 5) { // Reset size after reaching max
                    pixelSize = 10 + index * 5;
                }
                point.point.pixelSize = pixelSize;
            });
        });
    }
    

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.point) {
    // Position and display the custom info box at the click position
    const customInfoBox = document.getElementById('customInfoBox');
    const infoContent = document.getElementById('infoContent');
    
    // Set a generic message for demonstration
    infoContent.innerHTML = `
        <strong>Info Box</strong><br>
        X: ${movement.position.x}<br>Y: ${movement.position.y}
    `;
    
    // Adjust the info box's position based on the click event and display it
    customInfoBox.style.left = movement.position.x + 'px';
    customInfoBox.style.top = movement.position.y + 'px';
    customInfoBox.style.display = 'block';
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Music control
document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('backgroundMusic');
    const muteButton = document.getElementById('muteButton');
    const icon = muteButton.querySelector('i');
  
    function updateIcon() {
      icon.className = backgroundMusic.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
  
    // Function to play music on first mouse movement
    function playMusicOnMouseMove() {
      backgroundMusic.play()
        .then(() => {
          // Remove the event listener after successful play to prevent repeated attempts
          document.removeEventListener('mousemove', playMusicOnMouseMove); 
          backgroundMusic.muted = false;
          updateIcon();
        })
        .catch(e => console.error("Playback failed:", e));
    }
  
    // Attach the playMusicOnMouseMove function to the document's mousemove event
    document.addEventListener('mousemove', playMusicOnMouseMove);
  
    muteButton.addEventListener('click', () => {
      // Check if already playing, then toggle mute
      if (!backgroundMusic.paused || backgroundMusic.currentTime) {
        backgroundMusic.muted = !backgroundMusic.muted;
        updateIcon();
      }
    });
  });