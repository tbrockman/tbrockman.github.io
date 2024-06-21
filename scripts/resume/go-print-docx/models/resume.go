package models

type AlternativeFormats struct {
	Text string `json:"text"`
	URL  string `json:"url"`
	Icon string `json:"icon"`
}

type Language struct {
	Name        string `json:"name"`
	Proficiency string `json:"proficiency"`
}

type Contact struct {
	Label string `json:"label"`
	Text  string `json:"text"`
	URL   string `json:"url"`
	Icon  string `json:"icon"`
}

type Link struct {
	Icon string `json:"icon"`
	Text string `json:"text"`
	URL  string `json:"url"`
}

type Highlight struct {
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Text  string `json:"text"`
}

type Project struct {
	Name        string   `json:"name"`
	Icon        string   `json:"icon"`
	Tags        []string `json:"tags"`
	Description []string `json:"description"`
	Links       []Link   `json:"links"`
}

type WorkExperience struct {
	Position     string      `json:"position"`
	Organization string      `json:"organization"`
	URL          string      `json:"url"`
	Location     string      `json:"location"`
	Start        string      `json:"start"`
	Highlights   []Highlight `json:"highlights"`
	Tags         []string    `json:"tags"`
	End          string      `json:"end,omitempty"`
}

type VolunteerExperience struct {
	Name        string   `json:"name"`
	Icon        string   `json:"icon"`
	Tags        []string `json:"tags"`
	Description []string `json:"description"`
	Links       []Link   `json:"links"`
}

type SectionTitleMap struct {
	Web struct {
		AlternativeFormats string `json:"alternative_formats"`
		About              string `json:"about"`
		Skills             string `json:"skills"`
		Projects           string `json:"projects"`
		Work               string `json:"work"`
		Volunteer          string `json:"volunteer"`
	} `json:"web"`
	Docx struct {
		About     string `json:"about"`
		Skills    string `json:"skills"`
		Work      string `json:"work"`
		Projects  string `json:"projects"`
		Volunteer string `json:"volunteer"`
	} `json:"docx"`
}

type SectionItemOrdering struct {
	Docx struct {
		Projects  []string `json:"projects"`
		Volunteer []string `json:"volunteer"`
	}
}

type SkillsComments struct {
	Languages string `json:"languages"`
	Keywords  string `json:"keywords"`
}

type Data struct {
	SectionTitleMap     SectionTitleMap     `json:"section-title-map"`
	SectionItemOrdering SectionItemOrdering `json:"section-item-ordering"`
	Comments            struct {
		Skills SkillsComments `json:"skills"`
	} `json:"comments"`
}

type Resume struct {
	AlternativeFormats []AlternativeFormats `json:"alternative_formats"`
	About              struct {
		Picture     string     `json:"picture"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		Location    string     `json:"location"`
		Languages   []Language `json:"languages"`
		Contacts    []Contact  `json:"contacts"`
		Whois       string     `json:"whois"`
		Mission     string     `json:"mission"`
	} `json:"about"`
	Skills struct {
		Languages []string `json:"languages"`
		Keywords  []string `json:"keywords"`
	} `json:"skills"`
	Projects  []Project             `json:"projects"`
	Work      []WorkExperience      `json:"work"`
	Volunteer []VolunteerExperience `json:"volunteer"`
	Data      Data                  `json:"data"`
}
