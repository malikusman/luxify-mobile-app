export interface QuestionnaireOption {
    value: string;
    label: string;
}

export interface QuestionnaireFormField {
    label: string;
    type: string;
    description?: string;
    note?: string;
    options?: QuestionnaireOption[];
}

export interface QuestionnaireQuestion {
    id: string;
    question: string;
    options: QuestionnaireOption[];
}

export interface QuestionnaireStyleInspirations {
    women: QuestionnaireOption[];
    men: QuestionnaireOption[];
}

export interface QuestionnaireResponse {
    form_fields: {
        date_of_birth?: QuestionnaireFormField;
        gender?: QuestionnaireFormField;
        [key: string]: QuestionnaireFormField | undefined;
    };
    questions: QuestionnaireQuestion[];
    style_inspirations?: QuestionnaireStyleInspirations;
}
