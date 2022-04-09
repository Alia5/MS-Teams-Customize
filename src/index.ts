import { enableDebuggingFeatures } from './msteamsDebugEnabler/debugEnabler';

const main = () => {
    enableDebuggingFeatures(process.argv).catch((err) => {
        console.error(err);
    });
};

main();
