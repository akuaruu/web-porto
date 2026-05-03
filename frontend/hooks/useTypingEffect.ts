import { useEffect, useState } from "react";

/**
 * Cycles through an array of strings with a typewriter + delete effect.
 *
 * @param texts  - Array of strings to cycle through
 * @param speed  - Typing speed in ms per character (default: 65)
 * @param pause  - How long to hold the fully-typed string (default: 1800ms)
 */
export function useTypingEffect(
    texts: string[],
    speed = 65,
    pause = 1800
): string {
    const [display, setDisplay] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (texts.length === 0) return;

        const current = texts[textIndex];
        let timeout: ReturnType<typeof setTimeout>;

        if (!deleting && charIndex <= current.length) {
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIndex));
                setCharIndex((c) => c + 1);
            }, speed);
        } else if (!deleting && charIndex > current.length) {
            timeout = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && charIndex > 0) {
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIndex - 1));
                setCharIndex((c) => c - 1);
            }, speed / 2.2);
        } else {
            setDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, deleting, textIndex, texts, speed, pause]);

    return display;
}