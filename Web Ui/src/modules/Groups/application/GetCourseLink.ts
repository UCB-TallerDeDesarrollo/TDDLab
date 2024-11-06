export function getCourseLink(groupid: number, userType: string) {
  const isLocalhost = window.location.hostname === "localhost";
  let baseUrl = window.location.protocol + "//" + window.location.hostname;
  if (isLocalhost) {
    baseUrl += ":" + window.location.port;
  }
  let invitationUrl = baseUrl + `/invitation?groupid=${groupid}&type=${userType}`;
  navigator.clipboard
    .writeText(invitationUrl)
    .then(() => {
      console.log("URL copied to clipboard:", invitationUrl);
    })
    .catch((error) => {
      console.error("Failed to copy:", error);
    });
}
