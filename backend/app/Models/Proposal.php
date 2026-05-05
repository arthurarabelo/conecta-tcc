<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proposal extends Model
{
    use HasFactory;
    protected $attributes = [
        'status' => 'open',
    ];

    protected $fillable = [
        'professor_id',
        'title',
        'description',
        'prerequisites',
        'max_slots',
        'department_id',
        'area_id',
        'status',
    ];

    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(KnowledgeArea::class, 'area_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function approvedApplications(): HasMany
    {
        return $this->hasMany(Application::class)->where('status', 'approved');
    }

    public function hasAvailableSlots(): bool
    {
        return $this->approvedApplications()->count() < $this->max_slots;
    }
}
