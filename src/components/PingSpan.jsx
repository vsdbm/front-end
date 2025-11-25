import { useState, useEffect } from "react";

const PingSpan = ({ client }) => {
    const [latency, setLatency] = useState(0);
    const [problem, setProblem] = useState(0);
    useEffect(() => {
        client.on("ping", (data) => {
            if (data.client_ts && data.server_ack_ts) {
                const { server_ts, server_ack_ts, client_ts } = data;
                const client_ack_ts = performance.now();
                const currentPing = Math.abs(
                    Math.round(
                        server_ack_ts - server_ts - (client_ack_ts - client_ts) / 2
                    )
                );
                if (Math.abs(latency - currentPing) < latency * 0.2) return;
                setLatency(currentPing);
            }
            // if (data.ping){
            //   setLatency(data.ping);
            //   setProblem(data.ping > 300);
            // }
            // const now = new Date().getTime();
            // setLatency(Math.abs(now - data.startTime));
            // if((now - data.startTime) < 0) setProblem(1)
        });
        return () => {
            client.off("ping");
        };
    }, []);
    return (
        <>
            <span>
                {latency}ms{" "}
                {latency < 51 ? "🚀 good" : latency < 301 ? "🙏 ok" : "🙅‍♂️ bad"}
            </span>
            {problem ? (
                <>
                    <br />
                    <small style={{ color: "#FDFD96" }}>
                        we may have a problem to evaluate your ping (try updating your
                        operational system clock)
                    </small>
                </>
            ) : (
                ""
            )}
        </>
    );
};

export default PingSpan;