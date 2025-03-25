export const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A"; // Handle empty/null values

    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short", // Jan, Feb, Mar
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true, // AM/PM format
    });
};
