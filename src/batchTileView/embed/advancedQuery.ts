
export const advancedQuery = async (query: string, ...input: Array<string>): Promise<any | null> => {
  try {
    return (await logseq.DB.datascriptQuery(query, ...input) as any)?.flat()
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

export const queryCodeContainsDoubleTags = `
[:find (pull ?b [:block/name])
:in $ ?tag1 ?tag2
:where
    [?b :block/original-name ?name]
    [?b :block/properties ?props]
    [(get ?props :tags) ?tags]
    [(contains? ?tags ?tag1)]
    [(contains? ?tags ?tag2)]]
`

