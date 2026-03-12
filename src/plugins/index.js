import mediapipe from './mediapipe'

export default function registerPlugins(app) {
    app.use(mediapipe);
    return app;
}