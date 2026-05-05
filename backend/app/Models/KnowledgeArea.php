<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeArea extends Model
{
    protected $fillable = ['name'];

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'area_id');
    }
}
