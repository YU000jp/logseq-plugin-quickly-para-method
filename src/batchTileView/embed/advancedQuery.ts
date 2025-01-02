
export const advancedQuery = async (query: string, array?: any): Promise<any | null> => {
  try {
    return (await logseq.DB.datascriptQuery(query, array) as any)?.flat()
  } catch (err: any) {
    console.warn(err)
  }
  return null
}

export const queryCodeContainsTag = `
[:find (pull ?p [:block/name])
    :in $ ?t
    :where
    [?p :block/name ?name]
    [?p :block/properties ?props]
    [(get ?props :tags) ?tags]
    [(contains? ?tags ?t)]]`

export const queryCodeUpdatedAtFromPageName = `
  [:find (pull ?p [:block/original-name :block/updated-at])
          :in $ ?name
          :where
          [?t :block/name ?name]
          [?p :block/tags ?t]]
  `