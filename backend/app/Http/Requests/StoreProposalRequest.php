<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    /**
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user()->isProfessor();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'prerequisites' => 'nullable|string',
            'max_slots' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'area_id' => 'nullable|exists:knowledge_areas,id',
        ];
    }
}
