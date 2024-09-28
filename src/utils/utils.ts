export function parseValueFromJson(
  json: string,
  key: string,
  defaultValue: any
) {
  try {
    const parsedJson = JSON.parse(json);

    const keys = key.split(".");
    let value = parsedJson;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function convertToDateInstance(dateString: string): Date {
  try {
    const date = new Date(dateString);
    if (date.toString() !== "Invalid Date") {
      return date;
    }

    // Split the date string into parts
    const [day, month, year] = dateString.split("/").map(Number);

    // Ensure the date components are valid numbers
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Invalid date components");
    }

    // Create a Date object using the components
    const dateInstance = new Date(year, month - 1, day);

    // Check if the resulting date is valid
    if (
      dateInstance.getFullYear() !== year ||
      dateInstance.getMonth() !== month - 1 ||
      dateInstance.getDate() !== day
    ) {
      throw new Error("Invalid date");
    }

    return dateInstance;
  } catch (error) {
    console.error(
      (error as Error)?.message || "Error converting date, returning today's date."
    );
    return new Date(); 
  }
}


type Result<T> = [T | null, any];

export async function handlePromise<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}


export function safelyDecodeJson(data:any){
  try{
    const json = JSON.parse(data)
    return json
  }catch(e){
    return null
  }
}

export const pushInRouter = (key: string, value: string) => {
  const currentUrl = new URL(window.location.href);

  currentUrl.searchParams.set(key, value);

  window.history.pushState({}, "", currentUrl);
};

export const getFromRouter = (key: string): string | null => {
  const currentUrl = new URL(window.location.href);

  // Get the query parameter value
  return currentUrl.searchParams.get(key);
};
