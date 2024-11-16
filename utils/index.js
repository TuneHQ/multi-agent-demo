const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Result } = require("agents-js");
const { JSDOM, VirtualConsole } = require("jsdom");

const getNearbyRestaurants = async () => {
  /**
   * @description Fetches a list of nearby restaurants from Zomato API
   */
  const resp = await fetch(
    "https://www.zomato.com/webroutes/getPage?page_url=/chennai/trending-this-week&location=&isMobile=0",
    {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: "https://www.zomato.com/chennai/trending-this-week",
        "Content-Type": "application/json",
        "x-zomato-csrft": "82503878566d6fd95ee1b906bd041513",
        DNT: "1",
        "Sec-GPC": "1",
        "Alt-Used": "www.zomato.com",
        Connection: "keep-alive",
        Cookie: process.env.ZOMATO_COOKIE,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Priority: "u=0",
        TE: "trailers",
      },
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return data?.page_data?.sections?.SECTION_ENTITIES_DATA?.map((resto) => {
        return {
          name: resto?.name,
          id: resto?.id,
          image: resto?.imageUrl,
          url: resto?.url,
          rating: resto?.rating?.rating_text,
        };
      });
    })
    .catch(() => {
      return [];
    });

  return new Result({
    value: JSON.stringify(resp),
    contextVariables: { lastSearch: { results: resp } },
  });
};

const findSlots = async (restaurant_id) => {
  /**
   * @param {number} restaurant_id - ID of the restaurant
   * @description Finds available time slots for booking at a specific restaurant
   *
   */
  restaurant_id =
    typeof restaurant_id === "object"
      ? restaurant_id?.restaurant_id
      : restaurant_id;
  const slots = await fetch(
    `https://api.zomato.com/dining-gw/consumer/web/tr/slots?res_id=${restaurant_id}`,
    {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: "https://www.zomato.com/",
        "x-zomato-csrft": "82503878566d6fd95ee1b906bd041513",
        Origin: "https://www.zomato.com",
        DNT: "1",
        "Sec-GPC": "1",
        "Alt-Used": "api.zomato.com",
        Connection: "keep-alive",
        Cookie: process.env.ZOMATO_COOKIE,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
      },
    }
  )
    .then((response) => response.json())
    .then((data) =>
      data?.slots_response?.slots?.map((slot) => {
        return {
          date_time: slot?.date_time,
          slot_id: slot?.slot_id,
          booking_option_id: slot?.booking_options?.[0]?.booking_option_id,
          restaurant_id: restaurant_id,
        };
      })
    )
    .catch((err) => {
      console.log(err);
    });

  return new Result({
    value: JSON.stringify(slots),
    contextVariables: { lastSlots: { slots: slots } },
  });
};

async function bookTable({
  restaurant_id,
  slot_id,
  booking_option_id,
  guests,
}) {
  /**
   * @param {number} restaurant_id - ID of the restaurant
   * @param {string} slot_id - ID of the time slot
   * @param {string} booking_option_id - ID of the booking option
   * @param {number} guests - Number of guests for the booking
   * @description Books a table at a specified restaurant for a given number of guests at the requested solt and booking option
   */
  console.log("Booking table...", {
    restaurant_id,
    slot_id,
    booking_option_id,
    guests,
  });
  if (!slot_id) {
    return findSlots(restaurant_id);
  }

  await fetch("https://api.zomato.com/dining-gw/consumer/web/cart/checkout", {
    method: "POST",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      Referer: "https://www.zomato.com/",
      "Content-Type": "application/json",
      "x-zomato-csrft": "82503878566d6fd95ee1b906bd041513",
      Origin: "https://www.zomato.com",
      DNT: "1",
      "Sec-GPC": "1",
      "Alt-Used": "api.zomato.com",
      Connection: "keep-alive",
      Cookie: process.env.ZOMATO_COOKIE,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Priority: "u=0",
      TE: "trailers",
    },
    body: JSON.stringify({
      res_id: restaurant_id + "",
      selected_covers: guests,
      slot_id: slot_id,
      booking_option_id: booking_option_id,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));

  return new Result({
    value: `Booked table successfully`,
    contextVariables: {
      lastBooking: {
        restaurant_id,
        slot_id,
        booking_option_id,
        guests,
      },
    },
  });
}

async function scheduleMeeting({
  date_time,
  title,
  participants,
  location,
  description,
}) {
  /**
   * @param {string} date_time - Date and time of the meeting in  Mon Nov 11 2024 23:28:43 GMT+0530 format
   * @param {string} title - Title or purpose of the meeting
   * @param {string} participants - List of meeting participants
   * @param {object} context_variables - Context from previous interactions
   * @param {string} location - Location of the meeting can be a meeting url or physical address url
   * @param {string} description - Description of the meeting
   * @description Schedules a meeting(or a calendar invite) with specified participants at the given date and time
   */
  date_time = new Date(date_time).getTime();
  console.log("Scheduling meeting...", {
    date_time,
    title,
    participants,
    location,
  });

  if (date_time.toString().length === 10) {
    date_time = date_time * 1000;
  }

  await fetch(
    `https://hooks.zapier.com/hooks/catch/20681553/25gto7i/?invite=${participants}&description=${description}&title=${title}&start=${date_time}&end=${
      date_time + 3600000
    }&location=${location}`
  );

  return new Result({
    value: `Scheduled meeting "${title}" with ${participants} for ${date_time}.`,
    contextVariables: {
      lastMeeting: {
        date_time,
        title,
        participants,
        location,
        description,
      },
    },
  });
}

async function conductResearch({ query }) {
  /**
   * @param {string} query - Research topic or question
   * @param {object} context_variables - Context from previous interactions
   * @description Conducts research on a given topic with configurable depth level and returns findings
   */

  const raw = JSON.stringify({
    q: query,
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SERPER_API_KEY,
    },
    body: raw,
    redirect: "follow",
  };
  let knowledgeGraph = "";

  try {
    const response = await fetch(
      "https://google.serper.dev/search",
      requestOptions
    );
    const result = await response.json();
    await new Promise(async (resolve) => {
      if (result?.answerBox) {
        knowledgeGraph = `${result.answerBox?.title} ${result.answerBox?.answer}`;
      }
      if (result?.organic?.length) {
        await result?.organic?.slice(0, 3)?.map(async (res, key) => {
          knowledgeGraph += res?.title + "\n" + res?.snippet;
          knowledgeGraph += await crawlWeb(res.link).then((content) => {
            if (key === 2) {
              console.log("Crawling completed");
              resolve();
            }
            return content?.slice(0, 1500);
          });
        });
      } else {
        resolve();
      }
    });
  } catch (error) {
    console.error(error);
  }

  return new Result({
    value: knowledgeGraph,
    contextVariables: {
      lastResearch: { query },
    },
  });
}

function removeTags(node) {
  if (node.hasChildNodes()) {
    node.childNodes.forEach((childNode) => {
      if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
        node.removeChild(childNode);
      } else {
        removeTags(childNode);
      }
    });
  }
}

function naiveInnerText(node) {
  const Node = node; // We need Node(DOM's Node) for the constants, but Node doesn't exist in the nodejs global space, and any Node instance references the constants through the prototype chain
  return [...node.childNodes]
    .map((childNode) => {
      switch (childNode.nodeType) {
        case Node.TEXT_NODE:
          return node.textContent;
        case Node.ELEMENT_NODE:
          return naiveInnerText(childNode);
        default:
          return "";
      }
    })
    .join("\n");
}

const crawlWeb = async (url) => {
  console.log("Crawling web for content...", url);
  let content = "";
  if (url.includes(".pdf")) return content;
  const controller = new AbortController();
  // setTimeout(() => {
  //   console.log("Aborting fetch", url);
  //   controller.abort();
  // }, 2000);

  const headers = {
    "Content-Type": "text/html",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ",
  };
  await fetch(url, {
    headers: headers,
    signal: controller.signal,
  })
    .then((response) => response.text())
    .then((data) => {
      content = data;
    })
    .catch((err) => {
      console.log("Not able to fetch url using fetch", err);
    });

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {
    // No-op to skip console errors.
  });

  // put the html string into a DOM
  const dom = new JSDOM(content ?? "", {
    virtualConsole,
  });

  const body = dom.window.document.querySelector("body");
  if (!body) throw new Error("body of the webpage is null");

  removeTags(body);
  // recursively extract text content from the body and then remove newlines and multiple spaces
  content = (naiveInnerText(body) ?? "").replace(/ {2}|\r\n|\n|\r/gm, "");
  return content;
};

module.exports = {
  getNearbyRestaurants,
  findSlots,
  bookTable,
  scheduleMeeting,
  conductResearch,
};
