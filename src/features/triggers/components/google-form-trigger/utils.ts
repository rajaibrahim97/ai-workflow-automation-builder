export const generateGoogleFormScript = (
  webhookUrl: string,
) => `function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  var responses = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    responses[itemResponse.getItem().getTitle()] =
      itemResponse.getResponse();
  }

  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses,
  };

  var WEBHOOK_URL = ${webhookUrl}

  try {
    var res = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    Logger.log("STATUS: " + res.getResponseCode());
    Logger.log("BODY: " + res.getContentText());
  } catch (err) {
    Logger.log("ERROR: " + err);
  }
}`;
